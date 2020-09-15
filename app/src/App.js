import "bootstrap/dist/css/bootstrap.css";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import { createJob, fetchJobs, fetchSources } from "./api";
import "./App.css";
import { ErrorBoundary } from "./ErrorBoundary";
import { JobInfo } from "./JobInfo";
import { LoadingSpinner } from "./LoadingSpinner";
import { SourceInfo } from "./SourceInfo";

function App() {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(undefined);
  const [sources, setSources] = useState(undefined);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchJobs(), fetchSources()])
      .then(([jobs, sources]) => {
        setJobs(jobs);
        setSources(sources || []);
      })
      .catch(setError)
      .then(() => {
        setLoading(false);
      });
  }, []);

  const onNewJob = useMemo(() => {
    return () => {
      setLoading(true);

      createJob()
        .then((job) => {
          alert(`Created new harvest job:\n${job.job_id}`);
        })
        .catch(setError)
        .then(() => {
          setLoading(false);
        });
    };
  }, []);

  return (
    <ErrorBoundary>
      <LoadingSpinner show={loading} />
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand>BREG Harvester</Navbar.Brand>
      </Navbar>
      <Container className="mt-4 mb-4">
        {!!error && (
          <Alert variant="danger">
            <Alert.Heading>An error ocurred</Alert.Heading>
            <p className="mb-0">{_.toString(error)}</p>
          </Alert>
        )}
        {!!jobs && (
          <Row>
            <Col>
              <h4 className="mb-3">Recent harvest jobs</h4>
              <Button
                variant="outline-primary"
                className="mb-3"
                onClick={onNewJob}
                disabled={_.isEmpty(sources)}
              >
                Enqueue new harvest job
              </Button>
              {_.isEmpty(jobs) ? (
                <Alert variant="info">
                  No jobs were found in the server queue
                </Alert>
              ) : (
                <Row>
                  {_.map(jobs, (job) => (
                    <Col key={job.job_id} lg={6} className="mb-3">
                      <JobInfo job={job} />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        )}
        {!!sources && (
          <Row>
            <Col>
              <h4 className="mb-3">Configured sources</h4>
              {_.isEmpty(sources) ? (
                <Alert variant="info">
                  There are no RDF sources configured
                </Alert>
              ) : (
                <Row>
                  {_.map(sources, (source) => (
                    <Col key={source.uri} lg={6} className="mb-3">
                      <SourceInfo source={source} />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </ErrorBoundary>
  );
}

export default App;
