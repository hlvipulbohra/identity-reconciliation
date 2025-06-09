import {  Request, Response } from "express";
import * as ContactService from "../services/contact.service";

export const createContact = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  // Validate input
  if (!email && !phoneNumber) {
    res.status(400).json({ error: "Email or phone number is required" });
    return;
  }
  
  // Validate types
  if (typeof email !== 'string' && typeof phoneNumber !== 'string') {
      res.status(400).json({ error: "Email or phone number must be a string" });
      return;
  }

  // Validate email format
  if (email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
  }

  // Validate phone number format 
  if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      res.status(400).json({ error: "Invalid phone number format" });
      return;
  }

  const response = await ContactService.createContact(email, phoneNumber)
  // Handle case where no contact was created
  if (!response){
    res.status(500).json({ error: "Failed to create contact" });
    return;
  } 
  // If a new contact was created, return the contact details
  res.status(200).json(response);
  return
  
}
