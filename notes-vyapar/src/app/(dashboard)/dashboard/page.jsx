"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/presentation/components/ui/ThemeToggle";
import { MotionLink, MotionButton } from "@/presentation/components/ui/MotionElements";

import useAuth from "@/presentation/hooks/useAuth";

import styles from "./page.module.css";

const PRIMARY_NAV = [
  { label: "Marketplace", href: "/notes" },
  { label: "Upload", href: "/my-notes" },
  { label: "Library", href: "/purchases" }
];

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "My Purchases", href: "/purchases" },
  { label: "Sales Analytics", href: "/earnings" },
  { label: "Settings", href: "/profile" },
  { label: "Support", href: "/notes" }
];

const formatMemberSince = (value) => {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(value);

function DashboardIcon({ type }) {
  const icons = {
    dashboard: "M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5Zm9 0A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4A1.5 1.5 0 0 1 18.5 11h-4A1.5 1.5 0 0 1 13 9.5Zm-9 9A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5Zm9 0a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5Z",
    bag: "M8 7V6a4 4 0 1 1 8 0v1h1.5A1.5 1.5 0 0 1 19 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 17.5v-9A1.5 1.5 0 0 1 6.5 7Zm2 0h4V6a2 2 0 1 0-4 0Z",
    chart: "M5 18.5V14a1 1 0 0 1 2 0v4.5a1 1 0 0 1-2 0Zm6 0V9a1 1 0 0 1 2 0v9.5a1 1 0 0 1-2 0Zm6 0V5a1 1 0 0 1 2 0v13.5a1 1 0 0 1-2 0ZM4 20a1 1 0 0 1 0-2h16a1 1 0 1 1 0 2Z",
    settings: "M10.325 4.317a1 1 0 0 1 1.35-.936l.7.286a1 1 0 0 0 .75 0l.7-.286a1 1 0 0 1 1.35.936l.05.755a1 1 0 0 0 .45.775l.625.406a1 1 0 0 1 .26 1.45l-.425.627a1 1 0 0 0-.15.738l.175.74a1 1 0 0 1-.95 1.23l-.76.03a1 1 0 0 0-.7.3l-.52.557a1 1 0 0 1-1.492 0l-.52-.557a1 1 0 0 0-.7-.3l-.76-.03a1 1 0 0 1-.95-1.23l.175-.74a1 1 0 0 0-.15-.738l-.425-.628a1 1 0 0 1 .26-1.449l.626-.406a1 1 0 0 0 .449-.775ZM12 14.25A2.75 2.75 0 1 0 12 8.75a2.75 2.75 0 0 0 0 5.5Z",
    help: "M12 20a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 20Zm0-16a8 8 0 0 1 4.98 14.26 1 1 0 0 1-1.24-1.57A6 6 0 1 0 6 12a1 1 0 1 1-2 0 8 8 0 0 1 8-8Zm.09 4a3.2 3.2 0 0 1 2.182.78 2.55 2.55 0 0 1 .888 1.99c0 1.34-.72 2.13-1.77 2.8-.91.58-1.14.88-1.14 1.57v.23a1 1 0 0 1-2 0v-.34c0-1.52.72-2.31 1.75-2.98.84-.55 1.16-.9 1.16-1.5 0-.68-.47-1.16-1.26-1.16-.69 0-1.19.27-1.74.84a1 1 0 0 1-1.44-1.4A4.25 4.25 0 0 1 12.09 8Z",
    badge: "M12 2.75 14.43 7l4.82.7-3.49 3.4.83 4.8L12 13.86 7.41 15.9l.83-4.8-3.49-3.4L9.57 7Z",
    logout: "M10 5a1 1 0 0 1 1-1h5.5A2.5 2.5 0 0 1 19 6.5v11a2.5 2.5 0 0 1-2.5 2.5H11a1 1 0 1 1 0-2h5.5a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5H11a1 1 0 0 1-1-1Zm-4.293 5.293a1 1 0 0 1 1.414 0L9 12.172V9a1 1 0 1 1 2 0v6a1 1 0 0 1-1.707.707l-3.586-3.586a1 1 0 0 1 0-1.414Z",
    earnings: "M4.75 6.5A2.75 2.75 0 0 1 7.5 3.75h9A2.75 2.75 0 0 1 19.25 6.5v11A2.75 2.75 0 0 1 16.5 20.25h-9A2.75 2.75 0 0 1 4.75 17.5Zm2.5 1.25a1 1 0 1 0 0 2h9.5a1 1 0 1 0 0-2Zm0 4.25a1 1 0 1 0 0 2h4.5a1 1 0 1 0 0-2Z",
    download: "M12 3.75a1 1 0 0 1 1 1v7.69l1.97-1.97a1 1 0 1 1 1.414 1.414l-3.677 3.677a1 1 0 0 1-1.414 0l-3.677-3.677A1 1 0 0 1 9.03 10.47L11 12.44V4.75a1 1 0 0 1 1-1Zm-6 12.5a1 1 0 0 1 1 1v.25a.75.75 0 0 0 .75.75h8.5a.75.75 0 0 0 .75-.75v-.25a1 1 0 1 1 2 0v.25a2.75 2.75 0 0 1-2.75 2.75h-8.5A2.75 2.75 0 0 1 5 17.5v-.25a1 1 0 0 1 1-1Z",
    note: "M7.75 4.75A2.75 2.75 0 0 0 5 7.5v9A2.75 2.75 0 0 0 7.75 19.25h8.5A2.75 2.75 0 0 0 19 16.5v-6.69a2.75 2.75 0 0 0-.805-1.945l-2.06-2.06A2.75 2.75 0 0 0 14.19 5H7.75Zm.25 4a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2Zm0 4a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2Zm0 4a1 1 0 1 1 0-2h5a1 1 0 1 1 0 2Z",
    plus: "M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6Z",
    menu: "M4 7a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5A1 1 0 0 1 4 7Zm0 5a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2Z"
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[type]} />
    </svg>
  );
}

function Avatar({ src, name, className }) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    return (name || "NV")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [name]);

  if (!src || hasError) {
    return <span className={`${className} ${styles.avatarFallback}`}>{initials}</span>;
  }

  return <img src={src} alt={`${name} avatar`} className={className} onError={() => setHasError(true)} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, status, isAuthenticated, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "ready" && !isAuthenticated) {
      startTransition(() => {
        router.replace("/");
      });
    }
  }, [isAuthenticated, router, status]);

  const statusCards = useMemo(() => {
    return [
      {
        label: "Total Earnings",
        value: formatCurrency(0),
        helper: "No sales recorded yet",
        icon: "earnings"
      },
      {
        label: "Library Downloads",
        value: "0",
        helper: "Downloads will appear here",
        icon: "download"
      },
      {
        label: "Active Curations",
        value: "0",
        helper: user?.isVerified ? "Profile is ready for uploads" : "Verify email to begin uploading",
        icon: "note"
      }
    ];
  }, [user?.isVerified]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
    } finally {
      startTransition(() => {
        router.push("/login?loggedOut=1");
      });
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((currentValue) => !currentValue);
  };

  if (status === "loading" || !user) {
    return (
      <main className={styles.loadingShell}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingPulse} />
          <p>Loading your archive...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.dashboardPage}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.sidebarBrand}>Notes Vyapar</div>

          <section className={styles.profileCard}>
            <span className={styles.profileBadge}>
              <DashboardIcon type="badge" />
            </span>
            <Avatar src={user.avatar} name={user.name} className={styles.sidebarAvatar} />
            <div>
              <h2>{user.name}</h2>
              <p>{user.isVerified ? "Premium Curator" : "Curator access pending"}</p>
            </div>
          </section>

          <nav className={styles.sidebarNav} aria-label="Dashboard navigation">
            {SIDEBAR_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={item.active ? styles.activeNavItem : styles.navItem}
              >
                <span className={styles.navIcon}>
                  <DashboardIcon
                    type={
                      item.label === "Dashboard"
                        ? "dashboard"
                        : item.label === "My Purchases"
                          ? "bag"
                          : item.label === "Sales Analytics"
                            ? "chart"
                            : item.label === "Settings"
                              ? "settings"
                              : "help"
                    }
                  />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
         

          <MotionButton type="button" className={styles.logoutButton} onClick={handleLogout} disabled={isLoggingOut}>
            <span className={styles.navIcon}>
              <DashboardIcon type="logout" />
            </span>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </MotionButton>
        </div>
      </aside>

      <section className={styles.contentArea}>
        <header className={styles.topbar}>
          <MotionButton
            type="button"
            className={styles.mobileMenuButton}
            onClick={handleMobileMenuToggle}
            aria-expanded={isMobileMenuOpen}
            aria-controls="dashboard-mobile-menu"
            aria-label="Toggle profile options"
          >
            <DashboardIcon type="menu" />
          </MotionButton>

          <nav className={styles.topbarNav} aria-label="Primary navigation">
            {PRIMARY_NAV.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.topbarProfile}>
            <ThemeToggle />
            <Avatar src={user.avatar} name={user.name} className={styles.topbarAvatar} />
          </div>
        </header>

        <section
          id="dashboard-mobile-menu"
          className={`${styles.mobileMenuPanel} ${isMobileMenuOpen ? styles.mobileMenuPanelOpen : ""}`}
          aria-label="Profile related options"
        >
          <div className={styles.mobileMenuHeader}>
            <div className={styles.mobileMenuIdentity}>
              <Avatar src={user.avatar} name={user.name} className={styles.mobileMenuAvatar} />
              <div>
                <strong>{user.name}</strong>
                <p>{user.isVerified ? "Premium Curator" : "Curator access pending"}</p>
              </div>
            </div>
            <MotionButton
              type="button"
              className={styles.mobileMenuClose}
              onClick={handleMobileMenuToggle}
            >
              Close
            </MotionButton>
          </div>

          <nav className={styles.mobileMenuLinks} aria-label="Mobile profile options">
            {SIDEBAR_LINKS.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                className={item.active ? styles.activeNavItem : styles.navItem}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={styles.navIcon}>
                  <DashboardIcon
                    type={
                      item.label === "Dashboard"
                        ? "dashboard"
                        : item.label === "My Purchases"
                          ? "bag"
                          : item.label === "Sales Analytics"
                            ? "chart"
                            : item.label === "Settings"
                              ? "settings"
                              : "help"
                    }
                  />
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.mobileMenuActions}>
            <MotionLink
              href="/my-notes"
              className={styles.primarySidebarButton}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload New Note
            </MotionLink>

            <MotionButton
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <span className={styles.navIcon}>
                <DashboardIcon type="logout" />
              </span>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </MotionButton>
          </div>
        </section>

        <section className={styles.hero}>
          <h1>Workspace Overview</h1>
          <p>
            Manage your digital artifacts, monitor your profile, and review account health inside
            the archive.
          </p>
        </section>

        <section className={styles.metricsGrid}>
          {statusCards.map((card) => (
            <article key={card.label} className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <DashboardIcon type={card.icon} />
              </div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className={styles.activityPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent Artifact Activity</h2>
            </div>
            <Link href="/notes">View All Records</Link>
          </div>

          <div className={styles.activityTable}>
            <div className={styles.tableHead}>
              <span>Note Description</span>
              <span>Date Uploaded</span>
              <span>Status</span>
              <span>Price</span>
            </div>

            <div className={styles.emptyTableState}>
              <div className={styles.identityCell}>
                <span className={styles.placeholderThumb}>
                  <DashboardIcon type="note" />
                </span>
                <div>
                  <strong>No notes uploaded yet</strong>
                  <p>Your real marketplace activity will appear here after the first upload.</p>
                </div>
              </div>
              <span>{formatMemberSince(user.createdAt)}</span>
              <span>
                <span className={user.isVerified ? styles.liveBadge : styles.processingBadge}>
                  {user.isVerified ? "Ready" : "Pending"}
                </span>
              </span>
              <span className={styles.priceValue}>{formatCurrency(0)}</span>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <strong>Notes Vyapar</strong>
            <p>&copy; 2026 Notes Vyapar. Knowledge curated.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/notes">Terms of Service</Link>
            <Link href="/profile">Privacy Policy</Link>
            <Link href="/verify-email">Academic Integrity</Link>
            <Link href="/profile">Contact</Link>
          </div>
        </footer>
      </section>

      <MotionLink href="/my-notes" className={styles.floatingUploadButton} aria-label="Upload new note">
        <DashboardIcon type="plus" />
      </MotionLink>
    </main>
  );
}
