<script>
    import axios from "axios";
    import { querystring } from "svelte-spa-router";
    import { jwt_token} from "../store";

        // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
        const api_root =
        "http://localhost:8080";

    export let params = {};
    let product_id;
    let user_id;
   
    let user = {
        username: null,
        name: null,
        email: null,
    };

    let product = {
        productname: null,
        description: null,
        productType: null,
        difficultyType: null,
        clothingType: null,
        size: null,
        price: null,
        patchart: null,
        userId: null,
        comment: null,

    };

    $: {
        product_id = params.id;
        getProduct();
        getUser();
    }


    function getProduct() {
        axios
            .get("http://localhost:8080/api/products/" + product.id)
            .then((response) => {
                product = response.data;
            });
    }

    function getUser() {
        axios.get("http://localhost:8080/api/users/" + user_Id)
            .then((response) => {
            user = response.data;
        });
    }

    function deleteProduct() {
        axios
            .delete("http://localhost:3001/api/products/" + id)
            .then((response) => {
                alert("Product " + product.productname + " deleted");
            })
            .catch((error) => {
                console.log(error);
                alert(error);
            });
    }
</script>


<!--<div class="col-md-12">-->
    <h1>Product {product.productname}</h1>
    <p>ID: {product._id}</p>
    <h3>{product.productType}</h3>

    <div class="md-12">
        <div class="col-md-4">
            <ul class="list-group">
                <li class="list-group-item-top active" aria-current="true">
                    Description:
                </li>
                <li class="list-group-item">
                    {product.description}
                </li>
            </ul>
        </div>
        <div class="col-md-1" />
        
<!--
        <div class="col-md-3">
            <ul class="list-group">
                <li class="list-group-item-top active" aria-current="true">
                    Talents:
                </li>
                {#each team.talents as talent}
                    <li class="list-group-item">
                        {talent}
                    </li>
                {/each}
            </ul>
        </div>
    </div>

    <h3>Members:</h3>

    <div class="row">
        {#each team.members as member}
            {#each allMembers as differentMember}
                {#if member === differentMember._id}
                    <div class="col-sm-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    {differentMember.firstName}
                                    {differentMember.lastName}
                                </h5>
                                <p class="card-text">
                                    Position: {differentMember.position}
                                </p>
                                <p>
                                    Experience in Years: {differentMember.experienceInYears}
                                </p>
                                <a
                                    href={"#/members/" + differentMember._id}
                                    class="my-button">See profile</a
                                >
                            </div>
                        </div>
                    </div>
                {/if}
            {/each}
        {/each}
    </div>
-->

    <div class="col-md-6" />

    <!--<button on:click={addMemberToTeam} class="my-button">Update</button>-->
    <a href="#/teams" on:click={deleteProduct} class="delete-button">Delete Product</a
    >
    <a class="back-button" href="#/products" role="button" aria-pressed="true"
        >Back</a
    >
    <div class="md-12" />
</div> 
