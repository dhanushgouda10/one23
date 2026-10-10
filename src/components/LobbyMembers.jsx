import { Avatar, StatusBadge } from "./primitives";
import { initialsOf } from "../lib/utils";

// The 3 people in the group. Display only, the data comes from GroupLobbyPage.
// members:          [{ fullName, email, rideStatus }]
// selfEmail:        my email, to show "(you)"
// sharingNames:     names of members who are sharing their location right now
export function LobbyMembers({ members, selfEmail, sharingNames }) {
  return (
    <section className="card">
      <h2 className="label">Your group ({members.length})</h2>
      <ul className="member-list">
        {members.map((member) => (
          <li key={member.email || member.fullName} className="member">
            <Avatar initials={initialsOf(member.fullName)} />
            <div>
              <p className="member-name">
                {member.fullName}
                {member.email && member.email === selfEmail ? (
                  <span className="hint"> (you)</span>
                ) : null}
              </p>
              {sharingNames.includes(member.fullName) ? (
                <p className="hint">Sharing location</p>
              ) : null}
            </div>
            <StatusBadge status={member.rideStatus} />
          </li>
        ))}
      </ul>
    </section>
  );
}
