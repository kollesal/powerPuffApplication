<script>
    import axios from "axios";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    let products = [];
    let product = {
        productname: null,
        description: null,
        productType: null,
        difficultyType: null,
        clothingType: null,
        size: null,
        price: null,
        patchart: null,
    };

    function getProducts() {
        var config = {
            method: "get",
            url: api_root + "/api/products",
            headers: {},
        };

        axios(config)
            .then(function (response) {
                products = response.data;
            })
            .catch(function (error) {
                alert("Could not get products");
                console.log(error);
            });
    }
    getProducts();

</script>

<h1>All Products</h1>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Product Name</th>
            <th>Product Type</th>
            <th>Difficulty Type</th>
            <th>Clothing Type</th>
            <th>Price</th>
            <th>Size</th>
        </tr>
    </thead>
    <tbody>
        {#each products as product, index}
            <tr
                class="row-tr"
                onclick="document.location = '{'#/products/' + product._id}';"
            >
                <td>
                    {index + 1}
                </td>
                <td>
                    {product.productname}
                </td>
                <td>
                    {product.productType}
                </td>
                <td>
                    {product.difficultyType}
                </td>
                <td>
                    {product.clothingType}
                </td>
                <td>
                    {product.price}
                </td>
                <td>
                    {product.size}
                </td>
            </tr>
        {/each}
        <tr>
            <dt>
                Number of Products: {products.length}
            </dt>
        </tr>
    </tbody>
</table>

<a
class="my-button"
href="#/create-product"
role="button"
aria-pressed="true">Add Product</a
>
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>

