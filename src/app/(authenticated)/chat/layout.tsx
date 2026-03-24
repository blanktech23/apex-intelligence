export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chat uses its own internal layout (channel list + message area),
  // so this layout is intentionally minimal — just passes through.
  // The parent authenticated layout provides Sidebar + TopBar.
  return <>{children}</>;
}
