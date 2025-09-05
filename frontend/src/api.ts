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
export const postTrip = async (trip: Omit<Trip, "_id">): Promise<AxiosResponse<Trip>> => {
  return API.post<Trip>("/trips", trip);
};

// Delete trip
export const deleteTrip = async (id: string): Promise<AxiosResponse<{ message: string }>> => {
  return API.delete(`/trips/${id}`);
};