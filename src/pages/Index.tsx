const Index = () => {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Home</h1>
      <p className="text-muted-foreground mb-6">
        Welcome to your dashboard! Navigate using the sidebar to explore different sections.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold">Quick Stats</h3>
          <p className="text-muted-foreground">View your important metrics at a glance.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
          <p className="text-muted-foreground">Stay updated with the latest changes.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
          <p className="text-muted-foreground">Access frequently used features.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
