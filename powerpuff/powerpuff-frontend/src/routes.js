
import Home from "./pages/Home.svelte";
import Users from "./pages/Users.svelte";
import Products from "./pages/Products.svelte";
import Utilities from "./pages/Utilities.svelte";
import CreateProduct from "./pages/CreateProduct.svelte";
import Account from "./pages/Account.svelte";

export default {
    '/': Home,
    '/home': Home,
    '/account': Account,
    '/products': Products,
    '/create-product': CreateProduct,

    '/users': Users,
    '/utilities': Utilities,
}