import { ContactResponse } from '../types/contact.types';
import prisma from '../config/prisma'
const contacts = prisma.contact;

export const createContact = async (email?: string, phoneNumber?: string): Promise<ContactResponse> => {
  const normalizedEmail = email?.toLowerCase(); 

  //  Step 1: Where clause to find existing contacts
  const whereClause = [];
  if (normalizedEmail) whereClause.push({ email: normalizedEmail });
  if (phoneNumber) whereClause.push({ phoneNumber });
  
  // Step 2: Fetch any matching contacts
  const matchedContacts = await contacts.findMany({
    where: {
      OR: whereClause
    }
  });

  // Step 3: If no matches, create a new primary contact and send response
  if (matchedContacts.length === 0) {
    const newPrimary = await createNewPrimaryContact(normalizedEmail, phoneNumber);
    return await generateResponse(newPrimary);
  }

  // Step 4.1: If matches found, we start the process of updating contacts and creating a new secondary contact 
  const primaryContactIdsSet = new Set<number>();
  let isExistingContact = false;

  matchedContacts.forEach(contact => {
    if (contact.linkPrecedence === 'primary') 
      primaryContactIdsSet.add(contact.id);
    else if (contact.linkedId) 
      primaryContactIdsSet.add(contact.linkedId);  
    
    // To prevent duplicate contact creation, we check if the contact already exists in DB
    if (contact.email === normalizedEmail && contact.phoneNumber === phoneNumber)
      isExistingContact = true; 
  });


  // Step 4.2: Fetch all primary contacts in a single DB call
  const primaryContactIds = Array.from(primaryContactIdsSet);
  const primaryContacts = await contacts.findMany({
    where: {
      id: {
        in: primaryContactIds,
      },
    },
  });


  // Step 4.3: Handle existing contact case
  // If the contact already exists, it will have only one primary contact..so we can generate and return response
  if(isExistingContact)
    return await generateResponse(primaryContacts[0]);
  

  // Step 4.4: Find the oldest primary contact
  const oldestPrimary = primaryContacts.reduce((oldest, current) => {
    return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
  }, primaryContacts[0]);


  // Step 4.5: Find all contacts that need to be updated. We will make all matched contacts as siblings of each other  
  const updateContactsIdsSet = new Set<number>();
  matchedContacts.forEach(contact => {
    if (contact.id !== oldestPrimary.id) 
      updateContactsIdsSet.add(contact.id)
  })
  primaryContactIds.forEach(id => {
    if (id !== oldestPrimary.id) 
      updateContactsIdsSet.add(id);
  })
  
  // Step 5: Update all other contacts to secondary..basically making all matched contacts as siblings
  const updateContactsIds = Array.from(updateContactsIdsSet);
  if (updateContactsIds.length > 0) {
    await contacts.updateMany({
      where: {
        id: { in: updateContactsIds }
      },
      data: {
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      }
    });
  }
  
  // Step 6: Generate response for the oldest primary contact. This is called before creating the new secondary contact
  // so that the response does not include the newly created secondary contact as given in the requirements
  const response = await generateResponse(oldestPrimary);

 // Step 7: Create request object details as a secondary contact linked to the oldest primary contact
  await contacts.create({
    data: {
      email: email ? email.toLowerCase() : null,
      phoneNumber: phoneNumber || null,
      linkedId: oldestPrimary.id,
      linkPrecedence: 'secondary'
    }
  });

  return response;
}

const createNewPrimaryContact = async (email?: string, phoneNumber?: string) => {
  // Create a new primary contact
  return await contacts.create({
    data: {
      email: email?.toLowerCase() || null,
      phoneNumber : phoneNumber || null,
      linkPrecedence: 'primary'
    }
  }); 
}

const generateResponse = async (primaryContact: any) :Promise<ContactResponse>  => {
  const secondaryContacts = await contacts.findMany({
    where: {
      linkedId: primaryContact.id,
    }
  });

  // Add Primary Contact's email and phone number to a set
  const emailListSet = new Set<string>();
  if(primaryContact.email) emailListSet.add(primaryContact.email);
  const phoneListSet = new Set<string>();
  if(primaryContact.phoneNumber) phoneListSet.add(primaryContact.phoneNumber);
  const secondaryContactIds: number[] = [];

  // Add Secondary Contacts' emails and phone numbers to the response
  secondaryContacts.forEach(contact => {  

    if(contact.email) emailListSet.add(contact.email);
    if(contact.phoneNumber) phoneListSet.add(contact.phoneNumber);
    secondaryContactIds.push(contact.id); 
    
  });
  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails: Array.from(emailListSet),
      phoneNumbers: Array.from(phoneListSet),
      secondaryContactIds: secondaryContactIds
    }
  };
}