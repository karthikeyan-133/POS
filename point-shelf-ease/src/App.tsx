import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
// Removed POS
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import ProductListPage from "./pages/products/List";
import AddNewProductPage from "./pages/products/AddNew";
import ProductCategoriesPage from "./pages/products/Categories";
import ProductTaxPage from "./pages/products/Tax";
import ProductUnitsPage from "./pages/products/Units";
import ProductBrandsPage from "./pages/products/Brands";
import ProductVariantsPage from "./pages/products/Variants";
import PrintLabelsPage from "./pages/products/PrintLabels";
// Removed Categories top-level page
// Removed Quotations top-level page
import SalesIndex from "./pages/SalesIndex";
import SalesListPage from "./pages/sales/List";
import AddNewSalePage from "./pages/sales/AddNew";
// Removed Returns top-level page
import Transfers from "./pages/Transfers";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SupplierListPage from "./pages/suppliers/List";
import AddNewSupplierPage from "./pages/suppliers/AddNew";
import Customers from "./pages/Customers";
import CustomerListPage from "./pages/customers/List";
import AddNewCustomerPage from "./pages/customers/AddNew";
import PurchaseRequests from "./pages/PurchaseRequests";
import PurchaseRequestListPage from "./pages/purchaseRequests/List";
import AddNewPurchaseRequestPage from "./pages/purchaseRequests/AddNew";
import Purchases from "./pages/Purchases";
import PurchaseListPage from "./pages/purchases/List";
import AddNewPurchasePage from "./pages/purchases/AddNew";
import PurchaseReturns from "./pages/PurchaseReturns";
import PurchaseReturnListPage from "./pages/purchaseReturns/List";
import AddNewPurchaseReturnPage from "./pages/purchaseReturns/AddNew";
import QuotationsIndex from "./pages/QuotationsIndex";
import QuotationsListPage from "./pages/quotations/List";
import AddNewQuotationPage from "./pages/quotations/AddNew";
import SalesReturnsIndex from "./pages/SalesReturnsIndex";
import SalesReturnListPage from "./pages/salesReturns/List";
import AddNewSalesReturnPage from "./pages/salesReturns/AddNew";
import DamageStock from "./pages/DamageStock";
import DamageStockListPage from "./pages/damageStock/List";
import AddNewDamageStockPage from "./pages/damageStock/AddNew";
import StockTransfer from "./pages/StockTransfer";
import StockTransferListPage from "./pages/stockTransfer/List";
import AddNewStockTransferPage from "./pages/stockTransfer/AddNew";
import Expense from "./pages/Expense";
import ExpenseListPage from "./pages/expense/List";
import AddNewExpensePage from "./pages/expense/AddNew";
import ExpenseCategoriesPage from "./pages/expense/Categories";
import Inquiry from "./pages/Inquiry";
import InquiryListPage from "./pages/inquiry/List";
import AddNewInquiryPage from "./pages/inquiry/AddNew";
import InquiryStatusPage from "./pages/inquiry/Status";
import InquirySourcesPage from "./pages/inquiry/Sources";
import Reminder from "./pages/Reminder";
import ReminderListPage from "./pages/reminder/List";
import AddNewReminderPage from "./pages/reminder/AddNew";
import Roles from "./pages/Roles";
import RolesListPage from "./pages/roles/List";
import AddNewRolePage from "./pages/roles/AddNew";
import UserListPage from "./pages/users/List";
import AddNewUserPage from "./pages/users/AddNew";
import UserRolePage from "./pages/users/UserRole";
import Email from "./pages/Email";
import SMTPSettingsPage from "./pages/email/SMTPSettings";
import EmailTemplatePage from "./pages/email/EmailTemplate";
import SendEmailPage from "./pages/email/SendEmail";
import StoreLocationPage from "./pages/settings/StoreLocation";
import CompanyProfilePage from "./pages/settings/CompanyProfile";
import LanguagePage from "./pages/settings/Language";
import PageHelperPage from "./pages/settings/PageHelper";
import CountryPage from "./pages/settings/Country";
import CityPage from "./pages/settings/City";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>}>
              <Route index element={<ProductListPage />} />
              <Route path="add" element={<AddNewProductPage />} />
              <Route path="categories" element={<ProductCategoriesPage />} />
              <Route path="tax" element={<ProductTaxPage />} />
              <Route path="units" element={<ProductUnitsPage />} />
              <Route path="brands" element={<ProductBrandsPage />} />
              <Route path="variants" element={<ProductVariantsPage />} />
              <Route path="print-labels" element={<PrintLabelsPage />} />
            </Route>
            <Route path="/suppliers" element={<Layout><Suppliers /></Layout>}>
              <Route index element={<SupplierListPage />} />
              <Route path="add" element={<AddNewSupplierPage />} />
            </Route>
            {/* Categories removed */}
            {/* Quotations removed */}
            <Route path="/sales" element={<Layout><SalesIndex /></Layout>}>
              <Route index element={<SalesListPage />} />
              <Route path="add" element={<AddNewSalePage />} />
            </Route>
            {/* Returns removed in favor of Sales Returns */}
            <Route path="/stock-transfer" element={<Layout><StockTransfer /></Layout>}>
              <Route index element={<StockTransferListPage />} />
              <Route path="add" element={<AddNewStockTransferPage />} />
            </Route>
            <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="/users" element={<Layout><Users /></Layout>}>
              <Route index element={<UserListPage />} />
              <Route path="add" element={<AddNewUserPage />} />
              <Route path="roles" element={<UserRolePage />} />
            </Route>
            <Route path="/email" element={<Layout><Email /></Layout>}>
              <Route index element={<SMTPSettingsPage />} />
              <Route path="templates" element={<EmailTemplatePage />} />
              <Route path="send" element={<SendEmailPage />} />
            </Route>
            <Route path="/settings" element={<Layout><Settings /></Layout>}>
              <Route index element={<StoreLocationPage />} />
              <Route path="company" element={<CompanyProfilePage />} />
              <Route path="language" element={<LanguagePage />} />
              <Route path="helper" element={<PageHelperPage />} />
              <Route path="country" element={<CountryPage />} />
              <Route path="city" element={<CityPage />} />
            </Route>
            <Route path="/customers" element={<Layout><Customers /></Layout>}>
              <Route index element={<CustomerListPage />} />
              <Route path="add" element={<AddNewCustomerPage />} />
            </Route>
            <Route path="/purchase-requests" element={<Layout><PurchaseRequests /></Layout>}>
              <Route index element={<PurchaseRequestListPage />} />
              <Route path="add" element={<AddNewPurchaseRequestPage />} />
            </Route>
            <Route path="/purchases" element={<Layout><Purchases /></Layout>}>
              <Route index element={<PurchaseListPage />} />
              <Route path="add" element={<AddNewPurchasePage />} />
            </Route>
            <Route path="/purchase-returns" element={<Layout><PurchaseReturns /></Layout>}>
              <Route index element={<PurchaseReturnListPage />} />
              <Route path="add" element={<AddNewPurchaseReturnPage />} />
            </Route>
            <Route path="/quotations" element={<Layout><QuotationsIndex /></Layout>}>
              <Route index element={<QuotationsListPage />} />
              <Route path="add" element={<AddNewQuotationPage />} />
            </Route>
            <Route path="/sales-returns" element={<Layout><SalesReturnsIndex /></Layout>}>
              <Route index element={<SalesReturnListPage />} />
              <Route path="add" element={<AddNewSalesReturnPage />} />
            </Route>
            <Route path="/damage-stock" element={<Layout><DamageStock /></Layout>}>
              <Route index element={<DamageStockListPage />} />
              <Route path="add" element={<AddNewDamageStockPage />} />
            </Route>
            <Route path="/expense" element={<Layout><Expense /></Layout>}>
              <Route index element={<ExpenseListPage />} />
              <Route path="add" element={<AddNewExpensePage />} />
              <Route path="categories" element={<ExpenseCategoriesPage />} />
            </Route>
                         <Route path="/inquiry" element={<Layout><Inquiry /></Layout>}>
               <Route index element={<InquiryListPage />} />
               <Route path="add" element={<AddNewInquiryPage />} />
               <Route path="status" element={<InquiryStatusPage />} />
               <Route path="sources" element={<InquirySourcesPage />} />
             </Route>
                           <Route path="/reminder" element={<Layout><Reminder /></Layout>}>
                <Route index element={<ReminderListPage />} />
                <Route path="add" element={<AddNewReminderPage />} />
              </Route>
              <Route path="/roles" element={<Layout><Roles /></Layout>}>
                <Route index element={<RolesListPage />} />
                <Route path="add" element={<AddNewRolePage />} />
              </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;