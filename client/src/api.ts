import axios from "axios";
import { APIRootPath } from "@fed-exam/config";

export type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
  paginatedData: object[];
};

export type ApiClient = {
  getTickets: (
    sortParam: string,
    pageNumber: number,
    searchTerm: string
  ) => Promise<Ticket[]> | any;
  postTickets: (newTitle: string, indexOfObject: number) => Promise<Ticket[]>;
  searchTicket: (searchTerm: string) => Promise<Ticket[]>;
};

export const createApiClient = (): ApiClient => {
  return {
    getTickets: async (
      sortParam: string,
      pageNumber: number,
      searchTerm: string
    ) => {
      const res = await axios.get(APIRootPath, {
        params: {
          sortBy: sortParam,
          page: pageNumber,
          superSearch: searchTerm,
        },
      });
      return res.data;
    },
    postTickets: async (newTitle: string, objectID) => {
      const res = await axios.patch(APIRootPath, [newTitle, objectID]);
      return res.data;
    },
    searchTicket: async (searchTerm: string) => {
      const res = await axios.get(APIRootPath, {
        params: {
          superSearch: searchTerm,
        },
      });
      return res.data;
    },
  };
};
