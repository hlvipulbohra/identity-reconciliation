import { createContact } from "../../services/contact.service";
import prisma from '../../config/prisma'

jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    contact: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    }
  }
}));

const mockFindMany = prisma.contact.findMany as jest.Mock;
const mockCreate = prisma.contact.create as jest.Mock;
const mockUpdateMany = prisma.contact.updateMany as jest.Mock;


describe('createContact service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create and return new primary contact when no matches exist', async () => {
    mockFindMany.mockResolvedValueOnce([]); // No matched contacts
    const createdPrimary = {
      id: 1,
      email: 'test@hillvalley.edu',
      phoneNumber: '123456',
      linkedId: null,
      linkPrecedence: 'primary',
      createdAt: new Date(),
    };
    mockCreate.mockResolvedValueOnce(createdPrimary); 
    mockFindMany.mockResolvedValueOnce([]); // No secondary contacts

    const result = await createContact('test@hillvalley.edu', '123456');
   
    expect(result).toEqual({
      contact: {
        primaryContatctId: 1,
        emails: ['test@hillvalley.edu'],
        phoneNumbers: ['123456'],
        secondaryContactIds: [],
      },
    });
  });

  it('should return existing contact if exact match is found', async () => {
    const existing = {
      id: 2,
      email: 'test@hillvalley.edu',
      phoneNumber: '123456',
      createdAt: new Date(),
      linkPrecedence: 'primary',
    };
    mockFindMany.mockResolvedValueOnce([existing]); // matchedContacts
    mockFindMany.mockResolvedValueOnce([existing]); // primaryContacts
    mockFindMany.mockResolvedValueOnce([]); // generateResponse (no secondaries)

    const result = await createContact('test@hillvalley.edu', '123456');

    expect(mockCreate).not.toHaveBeenCalled(); // no new contact
    expect(result.contact.primaryContatctId).toBe(existing.id);
    expect(result.contact.emails).toContain(existing.email);
    expect(result.contact.phoneNumbers).toContain(existing.phoneNumber);
    expect(result.contact.secondaryContactIds).toEqual([]);
  });

  it('should update and create secondary if partial match found', async () => {
    const matched1 = {
      id: 3,
      email: 'test@hillvalley.edu',
      phoneNumber: '123456',
      createdAt: new Date(),
      linkPrecedence: 'primary',
    };
    const matched2 = {
      id: 4,
      email: 'test2@hillvalley.edu',
      phoneNumber: '111111',
      createdAt: new Date(),
      linkPrecedence: 'primary',
    };

    // Step 1: initial matchedContacts
    mockFindMany.mockResolvedValueOnce([matched1, matched2]);

    // Step 2: Fetch primary contacts
    mockFindMany.mockResolvedValueOnce([matched1, matched2]);

    // Step 3: generateResponse for oldest (matched1)
    mockFindMany.mockResolvedValueOnce([]);

    const secondaryCreated = {
      id: 5,
      email: 'test@hillvalley.edu',
      phoneNumber: '222222',
      linkedId: matched1.id,
      linkPrecedence: 'secondary',
      createdAt: new Date(),
    };

    mockUpdateMany.mockResolvedValueOnce({ count: 2 });
    mockCreate.mockResolvedValueOnce(secondaryCreated);

    const result = await createContact('test@hillvalley.edu', '222222');
  
    expect(result.contact.primaryContatctId).toBe(matched1.id);
    expect(result.contact.emails).toContain('test@hillvalley.edu');
    expect(result.contact.phoneNumbers).toContain('123456');
  });

  it('should handle secondary contact with linkedId and include it in response', async () => {
    const primary = {
      id: 6,
      email: 'main@hillvalley.edu',
      phoneNumber: '777777',
      createdAt: new Date(),
      linkPrecedence: 'primary',
    };

    const secondary = {
      id: 7,
      email: 'secondary@hillvalley.edu',
      phoneNumber: '888888',
      createdAt: new Date(),
      linkPrecedence: 'secondary',
      linkedId: 6,
    };

    // matchedContacts (1 primary, 1 secondary with linkedId)
    mockFindMany.mockResolvedValueOnce([primary, secondary]);

    // primaryContacts (should resolve both)
    mockFindMany.mockResolvedValueOnce([primary]);

    // secondary contacts for generateResponse
    mockFindMany.mockResolvedValueOnce([secondary]);

    mockUpdateMany.mockResolvedValueOnce({ count: 1 });

    const newSecondary = {
      id: 8,
      email: 'new@hillvalley.edu',
      phoneNumber: '777777',
      linkedId: 6,
      linkPrecedence: 'secondary',
      createdAt: new Date(),
    };

    mockCreate.mockResolvedValueOnce(newSecondary);

    const result = await createContact('new@hillvalley.edu', '777777');

    expect(result.contact.primaryContatctId).toBe(6);
    expect(result.contact.emails).toEqual(expect.arrayContaining(['main@hillvalley.edu', 'secondary@hillvalley.edu']));
    expect(result.contact.phoneNumbers).toEqual(expect.arrayContaining(['777777', '888888']));
    expect(result.contact.secondaryContactIds).toEqual(expect.arrayContaining([7]));
  });

  it('should work with only phoneNumber and no email', async () => {
    mockFindMany.mockResolvedValueOnce([]); // no matches
    const created = {
      id: 10,
      email: null,
      phoneNumber: '999999',
      linkedId: null,
      linkPrecedence: 'primary',
      createdAt: new Date(),
    };
    mockCreate.mockResolvedValueOnce(created);
    mockFindMany.mockResolvedValueOnce([]); // no secondaries
  
    const result = await createContact(undefined, '999999');
  
    expect(result.contact.primaryContatctId).toBe(10);
    expect(result.contact.emails).toEqual([]);
    expect(result.contact.phoneNumbers).toEqual(['999999']);
  });

  it('should work with only email and no phoneNumber', async () => {
    mockFindMany.mockResolvedValueOnce([]); // no matches
    const created = {
      id: 10,
      email: "test@hillvalley.edu",
      phoneNumber: null,
      linkedId: null,
      linkPrecedence: 'primary',
      createdAt: new Date(),
    };
    mockCreate.mockResolvedValueOnce(created);
    mockFindMany.mockResolvedValueOnce([]); // no secondaries
  
    const result = await createContact('test@hillvalley.edu', undefined);
  
    expect(result.contact.primaryContatctId).toBe(10);
    expect(result.contact.emails).toEqual(['test@hillvalley.edu']);
    expect(result.contact.phoneNumbers).toEqual([]);
  });
});

