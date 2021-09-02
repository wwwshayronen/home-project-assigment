import React, { Component } from "react";
import ShowMoreText from "react-show-more-text";
import { EmailShareButton } from "react-share";
import { SocialIcon } from "react-social-icons";
import ReactPaginate from "react-paginate";

type MyProps = {
  totalItems: number;
  onPageChange: object | number | any;
  isListSorted: boolean;
  sortBy: string;
  tickets: any;
  changeTitleOnClick: number | any;
};

export default class TicketList extends Component<MyProps> {
  render() {
     // destructuring props 
    const {
      totalItems,
      onPageChange,
      isListSorted,
      sortBy,
      tickets,
      changeTitleOnClick,
    } = this.props;
    return (
      <div>
        <ul className="tickets">
          <div>
            <ReactPaginate
              previousLabel={"previous"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(totalItems / 20)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={onPageChange}
              containerClassName={"pagination"}
              activeClassName={"active"}
            />
          </div>
          <h3>{isListSorted && `Sorted by ${sortBy}`}</h3>
          {tickets.map((ticket: any, objNumber: any) => (
            <li key={ticket.id} className="ticket">
              <h5 className="title">{ticket.title}</h5>
              <button
                className="rename-button"
                onClick={() => changeTitleOnClick(ticket.id, objNumber)}
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
      </div>
    );
  }
}
