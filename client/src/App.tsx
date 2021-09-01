import React, { CSSProperties } from "react";
import "./App.scss";
import ShowMoreText from "react-show-more-text";
import { EmailShareButton } from "react-share";
import { SocialIcon } from "react-social-icons";
import ReactPaginate from "react-paginate";
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
  divVisibility: string | number | CSSProperties;
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
    divVisibility: "visible",
  };

  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      tickets: await api.getTickets(
        "",
        this.state.currentPage,
        this.state.search
      ),
    });

    this.setState((state) => ({ paginatedData: state.tickets.paginatedData }));

    this.setState((state) => ({ total: state.tickets.totalItems }));
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.sortBy !== prevState.sortBy) {
      this.setState({
        tickets: await api.getTickets(
          this.state.sortBy,
          this.state.currentPage,
          this.state.search
        ),
      });
      this.setState({
        flag: true,
      });

      this.setState((state) => ({
        paginatedData: state.tickets.paginatedData,
      }));

      this.setState((state) => ({ total: state.tickets.totalItems }));
    }

    if (this.state.search !== prevState.search) {
      this.setState({
        tickets: await api.searchTicket(this.state.search),
      });

      this.setState((state) => ({
        paginatedData: state.tickets.paginatedData,
      }));

      this.setState((state) => ({ total: state.tickets.totalItems }));

      this.setState((state) => ({ divVisibility: "hidden" }));
    }

    if (this.state.currentPage !== prevState.currentPage) {
      console.log("current page:", this.state.currentPage);
      this.setState({
        tickets: await api.getTickets(
          "",
          this.state.currentPage,
          this.state.search
        ),
      });

      this.setState((state) => ({
        paginatedData: state.tickets.paginatedData,
      }));

      this.setState((state) => ({ total: state.tickets.totalItems }));
    } else if (this.state.currentPage === 0) {
      this.setState({
        tickets: await api.getTickets("", 1, this.state.search),
      });
      this.setState((state) => ({
        paginatedData: state.tickets.paginatedData,
      }));

      this.setState((state) => ({ total: state.tickets.totalItems }));
    }
  }
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
    // if (selectedPage === 1) {
    //   this.setState((state) => ({ currentPage: 2 }));
    // }
    this.setState((state) => ({ currentPage: selectedPage }));
  };

  renderTickets = (tickets: Ticket[]) => {
    return (
      <>
        <TicketList
          showDiv={this.state.divVisibility}
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
    console.log(paginatedData);

    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => this.handleOnchageValue(e.target.value)}
          />
        </header>
        <button onClick={this.onSearch}>Search</button>
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
