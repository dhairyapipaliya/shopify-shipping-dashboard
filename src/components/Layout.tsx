import React from "react";
import { Nav } from "./Nav.js";

type Props = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
};

export function Layout({ children, eyebrow, title }: Props) {
  return (
    <div className="app-shell">
      <Nav />
      <div className="app-content">
        <header className="topbar">
          <button
            className="sidebar-toggle"
            type="button"
            aria-label="Toggle sidebar"
            onClick={() => document.body.classList.toggle("sidebar-open")}
          >
            ☰
          </button>
          {(eyebrow || title) && (
            <div>
              {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
              {title && <h1>{title}</h1>}
            </div>
          )}
        </header>
        <main className="container">{children}</main>
      </div>
    </div>
  );
}
