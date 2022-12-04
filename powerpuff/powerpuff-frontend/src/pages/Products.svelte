<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root =
        "http://localhost:8080";

    let currentPage;
    let nrOfPages = 0;

    let pricesMin, pricesMax, type;

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

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getProducts();
    }

    function getProducts() {
        let query = "pageSize=6&page=" + currentPage;


        if (pricesMin) {
            query += "&min=" + pricesMin;
        }
        if (pricesMax) {
            query += "&max=" + pricesMax;
        }
        if (type) {
            query += "&type=SCHNITTMUSTER"
        }

        var config = {
            method: "get",
            url: api_root + "/api/products?" + query,
            headers: {},
        };

        axios(config)
            .then(function (response) {
                products = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get products");
                console.log(error);
            });
    }

    function getProductsSchnittmuster() {
        let query = "pageSize=6&page=" + currentPage + "&type=SCHNITTMUSTER";

        var config = {
            method: "get",
            url: api_root + "/api/products?" + query,
            headers: {},
        };

        axios(config)
            .then(function (response) {
                products = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get products");
                console.log(error);
            });
    }
  
</script>

<h1>All Products</h1>

<a class="my-button" href="#/create-product" role="button" aria-pressed="true"
    >Add Product</a
>
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>

<div class="row my-3">
    <div class="col-auto">
        <label for="" class="col-form-label">Price: </label>
    </div>
    <div class="col-3">
        <input
            class="form-control"
            type="number"
            placeholder="from"
            bind:value={pricesMin}
        />
    </div>
    <div class="col-3">
        <input
            class="form-control"
            type="number"
            placeholder="to"
            bind:value={pricesMax}
        />
    </div>
    <div class="col-3">
        <button class="btn btn-primary" on:click={getProductsSchnittmuster}>Apply</button>
    </div>
</div>

<button on:click={getProducts}>Schnittmuster</button>

<div class="row row-cols-1 row-cols-md-3 g-4">
    {#each products as product, index}
        <div class="container">
            <div class="col-10">
                <div class="card mb-2">
                    <div
                        class="card"
                        onclick="document.location = '{'#/products/' +
                            product.id}';"
                    >
                        <!-- svelte-ignore a11y-img-redundant-alt -->
                        <img
                            class="card-img-top"
                            src="/images/default.png"
                            alt="Card image cap"
                        />
                        <div class="card-body">
                            <h5 class="card-title">
                                {product.productname}
                                <span class="badge"
                                    >{product.difficultyType}</span
                                >
                            </h5>

                            <p class="card-text" />
                            <p>
                                Product Type: {product.productType}
                            </p>
                            <p>
                                Clothing Type: {product.clothingType}
                            </p>

                            <p>
                                Product Price: {product.price}
                            </p>

                            <p>
                                Product Size: {product.size}
                            </p>

                            <p class="card-text">
                                <small class="text-muted"
                                    >Product Number: {index + 1}</small
                                >
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

<nav>
    <ul class="pagination">
        {#each Array(nrOfPages) as _, i}
            <li class="page-item">
                <a
                    class="page-link"
                    class:active={currentPage == i + 1}
                    href={"#/products?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
    </ul>
</nav>

<a class="my-button" href="#/create-product" role="button" aria-pressed="true"
    >Add Product</a
>
<a class="back-button" href="#/" role="button" aria-pressed="true">Back</a>
