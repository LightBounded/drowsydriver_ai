import { Link } from "@tanstack/react-router";

export function Sidebar() {
  return (
    <div className="w-80 p-4">
      <h1>Admin Tool</h1>
      <ul>
        <li>
          <Link to="/truckers">Truckers</Link>
        </li>
      </ul>
    </div>
  );
}
