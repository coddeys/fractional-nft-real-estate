import Connect from "../islands/Connect.tsx";

export function Header(props: { blockfrost: string }) {
  return (
    <div className="navbar bg-base-100 relative">
      <div className="flex-1">
        <a class="btn btn-ghost text-xl" href="/">
          <svg
            class="h-10"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="currentColor">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M24.507 10.138a1 1 0 0 0-1.014 0L5.631 20.645l1.014 1.724L24 12.16l17.355 10.21l1.014-1.724L36 16.9V12a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v1.957zM14 25h11v6H14z"
                clip-rule="evenodd"
              />
              <path
                fill-rule="evenodd"
                d="m24 14l-14 8v14H5a1 1 0 1 0 0 2h36a1 1 0 1 0 0-2h-3V22zm0 2.303l-12 6.858V36h16V25h6v11h2V23.16z"
                clip-rule="evenodd"
              />
            </g>
          </svg>
          Estate Club
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a href="/manager">Property Managment Company</a>
          </li>
          <li>
            <a href="/investor">Investor</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
