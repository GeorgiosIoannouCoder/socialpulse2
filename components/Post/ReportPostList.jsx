import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import Router from "next/router";
import { List, Popup, Image } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { ReportsPlaceHolder } from "../Layout/PlaceHolderGroup";

function ReportPostList({ postId, trigger }) {
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getReportList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/report/${postId}`, {
        headers: { Authorization: cookie.get("token") },
      });
      setReportList(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setReportList([])}
      onOpen={getReportList}
      popperDependencies={[reportList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <ReportsPlaceHolder />
      ) : (
        <>
          {reportList.length > 0 && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "15rem",
                height: "15rem",
                minWidth: "210px",
              }}
            >
              <List selection size="large">
                {reportList.map((report) => (
                  <List.Item key={report._id}>
                    {report.user ? (
                      <Image avatar src={report.user.profilePicUrl} />
                    ) : (
                      <Image
                        avatar
                        src={
                          "https://cdn.icon-icons.com/icons2/2518/PNG/512/question_mark_icon_151137.png"
                        }
                      />
                    )}

                    {report.user ? (
                      <List.Content>
                        <List.Header
                          onClick={() =>
                            Router.push(`/${report.user.username}`)
                          }
                          as="a"
                          content={report.user.name}
                        />
                      </List.Content>
                    ) : (
                      <List.Content>
                        <List.Header
                          as="a"
                          content="Surfer"
                          style={{ marginTop: "5px" }}
                        />
                      </List.Content>
                    )}
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      )}
    </Popup>
  );
}

export default ReportPostList;
