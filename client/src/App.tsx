import React from "react";
import "./App.scss";
import { createApiClient, Ticket } from "./api";
import TicketList from "./TicketList";

export type AppState = {
  tickets?: Ticket[] | any;
  paginatedData?: Ticket[] | any;
  search: string;
  sortBy: string;
  flag: boolean;
  currentPage: number;
  total: number;
  value: string;
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: "",
    tickets: [],
    sortBy: "",
    flag: false,
    currentPage: 1,
    paginatedData: [],
    total: 0,
    value: "",
  };

  searchDebounce: any = null;

  async componentDidMount() {
    this.handleApiCall("", this.state.currentPage, this.state.search);
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.sortBy !== prevState.sortBy) {
      this.handleApiCall(
        this.state.sortBy,
        this.state.currentPage,
        this.state.search
      );

      this.setState({
        flag: true,
      });
    }

    if (this.state.search !== prevState.search) {
      this.handleApiCall("", this.state.currentPage, this.state.search);
    }

    if (this.state.currentPage !== prevState.currentPage) {
      this.handleApiCall("", this.state.currentPage, this.state.search);
    } else if (this.state.currentPage === 0) {
      this.handleApiCall("", 1, this.state.search);
    }
  }

  // handle all getTickets calls
  handleApiCall = async (
    sortListBy: string,
    pageNumber: number,
    searchTerm: string
  ) => {
    this.setState({
      tickets: await api.getTickets(sortListBy, pageNumber, searchTerm),
    });

    this.setState((state) => ({
      paginatedData: state.tickets.paginatedData,
    }));

    this.setState((state) => ({ total: state.tickets.totalItems }));
  };

  changeTitleOnClick = (ticketId: any, index: number) => {
    // open prompt and save user input in res var
    const res: any = prompt("Please enter a new title");

    if (!res) {
      alert("To change title, you need to enter text after click rename.");
    }

    // set state with the new title
    this.setState((state) => (state.tickets.paginatedData![index].title = res));

    //TODO: send the changes to the backend
    api.postTickets(res, ticketId);
  };

  handlePageChange = (data: object | any) => {
    const selectedPage: number | AppState | any = data.selected + 1;

    this.setState({ currentPage: selectedPage });
  };

  renderTickets = (tickets: Ticket[]) => {
    return (
      <>
        <TicketList
          totalItems={this.state.total}
          onPageChange={this.handlePageChange}
          flag={this.state.flag}
          sortBy={this.state.sortBy}
          tickets={this.state.paginatedData}
          changeTitleOnClick={this.changeTitleOnClick}
        />
      </>
    );
  };

  onSearch = async () => {
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(async () => {
      this.state.value !== null &&
        this.setState({
          search: this.state.value,
        });
    }, 300);
  };

  handleOnchageValue = (val: string) => {
    val && this.setState({ value: val });
  };

  render() {
    const { paginatedData } = this.state;

    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => this.handleOnchageValue(e.target.value)}
          />
          <button className="search-button" onClick={this.onSearch}>
            Search
          </button>
        </header>
        {paginatedData ? (
          <>
            <div className="results">
              Showing {paginatedData.length} results from total{" "}
              {this.state.total}
            </div>
            <button
              className="sort-button"
              onClick={() => this.setState({ sortBy: "date" })}
            >
              Sort by date
            </button>
            <button
              className="sort-button"
              onClick={() => this.setState({ sortBy: "email" })}
            >
              Sort by email
            </button>
            <button
              className="sort-button"
              onClick={() => this.setState({ sortBy: "title" })}
            >
              Sort by title
            </button>
          </>
        ) : null}
        {paginatedData.length ? (
          this.renderTickets(paginatedData)
        ) : this.state.search ? (
          <h2>No tickets found</h2>
        ) : (
          <h2>Loading..</h2>
        )}
      </main>
    );
  }
}

export default App;
