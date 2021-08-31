import React from "react";
import "./App.scss";
import ShowMoreText from "react-show-more-text";
import { EmailShareButton } from "react-share";
import { SocialIcon } from "react-social-icons";
import { createApiClient, Ticket } from "./api";

export type AppState = {
  tickets?: Ticket[];
  search: string;
  sortBy: string;
  flag: boolean;
};

const api = createApiClient();

export class App extends React.PureComponent<{}, AppState> {
  state: AppState = {
    search: "",
    tickets: [],
    sortBy: "",
    flag: false,
  };

  searchDebounce: any = null;

  async componentDidMount() {
    this.setState({
      tickets: await api.getTickets(this.state.sortBy),
    });
  }

  async componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.sortBy !== prevState.sortBy) {
      this.setState({
        tickets: await api.getTickets(this.state.sortBy),
      });
      this.setState({
        flag: true,
      });
    }

    if (this.state.search !== prevState.search) {
      this.setState({
        tickets: await api.searchTicket(this.state.search),
      });
    }
  }
  changeTitleOnClick = (index: number) => {
    // open prompt and save user input in res var
    const res: any = prompt("Please enter a new title");

    if (!res) {
      alert("To change title, you need to enter text after click rename.");
    }

    // set state with the new title
    this.setState((state) => (state.tickets![index].title = res));

    //TODO: send the changes to the backend
    api.postTickets(res, index);
  };

  renderTickets = (tickets: Ticket[]) => {
    // const filteredTickets = tickets.filter((t) =>
    //   (t.title.toLowerCase() + t.content.toLowerCase()).includes(
    //     this.state.search.toLowerCase()
    //   )
    // );

    return (
      <ul className="tickets">
        <h3>{this.state.flag && `Sorted by ${this.state.sortBy}`}</h3>
        {tickets.map((ticket, ObjNumber) => (
          <li key={ticket.id} className="ticket">
            <h5 className="title">{ticket.title}</h5>
            <button
              className="rename-button"
              onClick={() => this.changeTitleOnClick(ObjNumber)}
            >
              Rename
            </button>
            <ShowMoreText
              lines={3}
              more={<span className="see-more-less-btn">See more</span>}
              less={<span className="see-more-less-btn">See less</span>}
              className="content-css"
              anchorClass="my-anchor-css-class"
              expanded={false}
            >
              <p>{ticket.content}</p>
            </ShowMoreText>
            <footer>
              <div className="meta-data">
                By {ticket.userEmail} |{" "}
                {new Date(ticket.creationTime).toLocaleString()}
                <EmailShareButton
                  url=""
                  subject={ticket.title}
                  body={ticket.content}
                  translate=""
                  style={{ marginLeft: "20px" }}
                >
                  <SocialIcon
                    className="icon"
                    network="email"
                    style={{
                      height: 30,
                      width: 30,
                      marginLeft: "5px",
                      marginTop: "5px",
                    }}
                  />
                </EmailShareButton>
              </div>
              {ticket.labels && <div className="labels">{ticket.labels}</div>}
            </footer>
          </li>
        ))}
      </ul>
    );
  };

  onSearch = async (val: string, newPage?: number) => {
    clearTimeout(this.searchDebounce);

    this.searchDebounce = setTimeout(async () => {
      this.setState({
        search: val,
      });
    }, 300);
    api.searchTicket(val);
  };

  render() {
    const { tickets } = this.state;

    return (
      <main>
        <h1>Tickets List</h1>
        <header>
          <input
            type="search"
            placeholder="Search..."
            onChange={(e) => this.onSearch(e.target.value)}
          />
        </header>
        {tickets ? (
          <>
            <div className="results">Showing {tickets.length} results</div>
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
        {tickets!.length ? (
          this.renderTickets(tickets!)
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
