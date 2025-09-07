// Update this page with a vibrant, colorful design
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="text-center max-w-3xl w-full">
        <div className="rounded-2xl p-8 bg-white border-2 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Welcome to Point Shelf Ease
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Your all-in-one Point of Sale & Inventory Management Solution
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="p-6 rounded-xl bg-gradient-to-br from-vibrant-blue/10 to-vibrant-purple/10 border border-vibrant-blue/20 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-vibrant-blue mb-3">Sales Management</h3>
              <p className="text-muted-foreground">Efficiently process sales and manage transactions</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-vibrant-green/10 to-vibrant-teal/10 border border-vibrant-green/20 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-vibrant-green mb-3">Inventory Control</h3>
              <p className="text-muted-foreground">Track stock levels and manage product information</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-vibrant-purple/10 to-vibrant-pink/10 border border-vibrant-purple/20 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-vibrant-purple mb-3">Reporting & Analytics</h3>
              <p className="text-muted-foreground">Gain insights with comprehensive business reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;