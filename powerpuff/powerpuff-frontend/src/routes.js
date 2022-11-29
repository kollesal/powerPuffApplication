
import Home from "./pages/Home.svelte";
import Users from "./pages/Users.svelte";
import Products from "./pages/Products.svelte";
import Utilities from "./pages/Utilities.svelte";
import CreateProduct from "./pages/CreateProduct.svelte";

export default {
    '/': Home,
    '/home': Home,
    '/products': Products,
    '/create-product': CreateProduct,

    '/users': Users,
    '/utilities': Utilities,
}