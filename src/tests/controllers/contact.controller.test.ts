import { createContact } from '../../controllers/contact.controller';
import {Request, Response} from 'express';
import * as ContactService from '../../services/contact.service';

// Create mock response
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


describe ('createContact Controller',() => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  it("should return 400 if both email and phoneNumber are missing", async () => {
    const req = {
      body: {}
    } as Request;
    const res = mockResponse();

    await createContact(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email or phone number is required" });

  })

  it('should return 400 if email and phoneNumber are not strings', async () => {
    const req = {
      body: { email: 123, phoneNumber: {} }
    } as Request;
    const res = mockResponse();

    await createContact(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email or phone number must be a string' });
  });

  it('should return 400 if email format is invalid', async () => {
    const req = {
      body: { email: 'invalidEmail', phoneNumber: '+1234567890' }
    } as Request;
    const res = mockResponse();

    await createContact(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
  });

  it('should return 400 if phone number format is invalid', async () => {
    const req = {
      body: { email: 'it@hillvalley.edu', phoneNumber: '@@@12345' }
    } as Request;
    const res = mockResponse();

    await createContact(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid phone number format' });
  }); 

  it('should return 500 if service returns null', async () => {
    const req = {
      body: { email: 'test@hillvalley.edu', phoneNumber: '123456' }
    } as Request;
    const res = mockResponse();

    jest.spyOn(ContactService, 'createContact').mockResolvedValue(null as any);

    await createContact(req, res);

    expect(ContactService.createContact).toHaveBeenCalledWith('test@hillvalley.edu', '123456');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create contact' });
  });

  it('should return 200 and the created contact on success', async () => {
    const req = {
      body: { email: 'test@hillvalley.edu', phoneNumber: '123456' }
    } as Request;
    const res = mockResponse();

    const mockContact = {
      "contact":{
        "primaryContatctId": 1,
        "emails": ["test@hillvalley.edu"],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": []
      }
    }
    jest.spyOn(ContactService, 'createContact').mockResolvedValue(mockContact);

    await createContact(req, res);

    expect(ContactService.createContact).toHaveBeenCalledWith('test@hillvalley.edu', '123456');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockContact);
  });

})