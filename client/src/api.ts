import axios from "axios";
import { APIPath, APIRootPath } from "@fed-exam/config";

export type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
};

export type ApiClient = {
  getTickets: (sortParam: string) => Promise<Ticket[]>;
  postTickets: (newTitle: string, indexOfObject: number) => Promise<Ticket[]>;
  searchTicket: (searchTerm: string) => Promise<Ticket[]>;
};

export const createApiClient = (): ApiClient => {
  return {
    getTickets: async (sortParam: string) => {
      const res = await axios.get(APIRootPath, {
        params: {
          sortBy: sortParam,
        },
      });
      return res.data;
    },
    postTickets: async (newTitle: string, indexOfObject) => {
      const res = await axios.patch(APIRootPath, [newTitle, indexOfObject]);
      console.log("returned data: ", res);
      return res.data;
    },
    searchTicket: async (searchTerm: string) => {
      console.log(searchTerm);
      const res = await axios.get(APIRootPath, {
        params: {
          superSearch: searchTerm,
        },
      });
      return res.data;
    },
  };
};
