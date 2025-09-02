import axios, { type AxiosResponse } from "axios";
import type { Trip } from "../../types/Trip";

const API = axios.create({
  baseURL: "http://localhost:5000", // change to your backend URL when deployed
});

// Get all trips
export const getTrips = async (): Promise<AxiosResponse<Trip[]>> => {
  return API.get<Trip[]>("/trips");
};

// Add a new trip
export const addTrip = async (trip: Trip): Promise<AxiosResponse<Trip>> => {
  return API.post<Trip>("/trips", trip);
};