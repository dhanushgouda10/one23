import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { joinRide, parseRide, apiErrorMessage } from "../lib/api";
import { toast } from "../lib/toast";
import { Input } from "../components/Input";
import { METRO_STATIONS, DESTINATIONS, findLocation } from "../lib/locations";

// Join a ride: pick a metro station + office and send it to POST /api/join.
// The backend answers with either:
//   - one ride (status WAITING)  -> no group yet, go to My rides
//   - a list of 3 rides (MATCHED) -> a group was formed, go to its lobby
export function JoinPage() {
  const navigate = useNavigate();
  const [station, setStation] = useState("");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasOpenRide, setHasOpenRide] = useState(false);

  // AI helper: the user types a sentence and we fill the two dropdowns for them
  const [aiText, setAiText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  async function handleParse(event) {
    event.preventDefault();
    setAiError("");
    setIsParsing(true);

    try {
      const result = await parseRide(aiText);

      // Turn the AI's words into names that exist in our dropdowns
      const foundStation = findLocation(result.pickupHub, METRO_STATIONS);
      const foundDestination = findLocation(result.destination, DESTINATIONS);

      // Fill whatever we understood; the user can still change it before joining
      if (foundStation) setStation(foundStation);
      if (foundDestination) setDestination(foundDestination);

      if (foundStation && foundDestination) {
        toast.success("Filled in! Check the details and tap Find my group.");
      } else {
        setAiError("We couldn't match that to our metro stations and offices. Please pick them below.");
      }
    } catch (err) {
      if (err.status === 429) {
        setAiError("Too many AI requests. Please wait a minute, or pick your route below.");
      } else if (err.status === 503) {
        setAiError("The AI helper is not available right now. Please pick your route below.");
      } else if (err.status === 400) {
        setAiError("Please mention both where you start and where you are going.");
      } else {
        setAiError(apiErrorMessage(err, "Something went wrong. Please pick your route below."));
      }
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setHasOpenRide(false);
    setIsSubmitting(true);

    try {
      const result = await joinRide({ pickupHub: station, destination });

      if (Array.isArray(result)) {
        toast.success("You're matched! Say hi to your group.");
        navigate(`/rides/${result[0].groupId}`);
      } else {
        toast.message(
          "Request sent. We'll put you in a group as soon as 3 people are on this route.",
        );
        navigate("/rides");
      }
    } catch (err) {
      // 409 = the user already has a waiting/matched/in-progress ride
      setHasOpenRide(err.status === 409);
      setError(apiErrorMessage(err, "Could not join. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Join a ride"
        description="You'll be grouped with 2 people going from the same metro station to the same office."
      />

      {/* AI helper: type a sentence, we fill in the form below */}
      <form onSubmit={handleParse} className="card form narrow ai-box">
        <div className="field">
          <label htmlFor="ai-text" className="label">
            Describe your ride (optional)
          </label>
          <Input
            id="ai-text"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. Hoodi to ITPL at 9am"
            maxLength={200}
          />
        </div>
        {aiError ? (
          <p role="alert" className="alert">
            {aiError}
          </p>
        ) : null}
        <Button type="submit" disabled={!aiText.trim() || isParsing}>
          {isParsing ? "Reading…" : "Fill with AI"}
        </Button>
      </form>

      <form onSubmit={handleSubmit} className="card form narrow">
        {error ? (
          <p role="alert" className="alert">
            {error} {hasOpenRide ? <Link to="/rides">Go to My rides</Link> : null}
          </p>
        ) : null}

        <div className="field">
          <label htmlFor="station" className="label">
            Metro station
          </label>
          <select
            id="station"
            required
            value={station}
            onChange={(e) => setStation(e.target.value)}
            className="input input-lg"
          >
            <option value="">Where do you get off?</option>
            {METRO_STATIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="destination" className="label">
            Office / destination
          </label>
          <select
            id="destination"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input input-lg"
          >
            <option value="">Where are you going?</option>
            {DESTINATIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          variant="lime"
          size="lg"
          className="btn-full"
          disabled={!station || !destination || isSubmitting}
        >
          {isSubmitting ? "Joining…" : "Find my group"}
        </Button>
      </form>
    </AppShell>
  );
}
