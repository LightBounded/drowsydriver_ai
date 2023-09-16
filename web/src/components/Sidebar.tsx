import { Link } from "@tanstack/react-router";

export function Sidebar() {
  return (
    <div className="w-80 p-4">
      <Link to="/">Admin Tool</Link>
      <ul>
        <li>
          <Link to="/truckers">Truckers</Link>
        </li>
      </ul>
    </div>
  );
}
