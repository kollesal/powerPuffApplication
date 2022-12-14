<script>
    import axios from "axios";
    import { jwt_token } from "../store";
    import { querystring } from "svelte-spa-router";
    import { isAuthenticated, user } from "../store";

    // TODO: Setze hier die URL zu deinem mit Postman erstellten Mock Server
    const api_root = "http://localhost:8080";
    var currentPage;
    let nrOfPages = 0;

    let utilities = [];
    let utility = {
        utilityName: null,
        unit: null,
        utilityType: null,
    };

    $: {
        let searchParams = new URLSearchParams($querystring);
        if (searchParams.has("page")) {
            currentPage = searchParams.get("page");
        } else {
            currentPage = "1";
        }
        getUtilities();
    }

    function getUtilities() {
        let query = "pageSize=6&page=" + currentPage;

        var config = {
            method: "get",
            url: api_root + "/api/utilities?" + query,
            headers: { Authorization: "Bearer " + $jwt_token },
        };

        axios(config)
            .then(function (response) {
                utilities = response.data.content;
                nrOfPages = response.data.totalPages;
            })
            .catch(function (error) {
                alert("Could not get utilities");
                console.log(error);
            });
    }

    function createUtility() {
        var config = {
            method: "post",
            url: api_root + "/api/utilities",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + $jwt_token
            },
            data: utility,
        };

        axios(config)
            .then(function (response) {
                alert("Utility created");
                getUtilities();
            })
            .catch(function (error) {
                alert("Could not create Utility");
                console.log(error);
            });
    }


</script>

<h1 class="mt-3">Create Utility</h1>
<form class="mb-5">
    <div class="row mb-3">
        <div class="col">
            <label class="form-label" for="utilityName">Name</label>
            <input
                bind:value={utility.utilityName}
                class="form-control"
                id="description"
                type="text"
            />
        </div>

        <div class="col">
                <label class="form-label" for="unit">Unit</label>
                <input
                    bind:value={utility.unit}
                    class="form-control"
                    id="earnings"
                    type="number"
                />
            </div>

        <div class="col">
            <label class="form-label" for="utilityType"
                >Utility Type</label
            >
            <select
                bind:value={utility.utilityType}
                class="form-select"
                id="type"
                type="text"
            >
                <option value="WRITING">Writing</option>
                <option value="MARKING">Marking</option>
                <option value="CUTTING">Cutting</option>
                <option value="SEWING">Sewing</option>
                <option value="MASCHINE">Maschine</option>
                <option value="FOOT">Foot</option>
                <option value="NEEDLE">Needle</option>
                <option value="ATTACHMENT">Attachment</option>
                <option value="MEASURING">Measuring</option>
                <option value="SECURITY">Security</option>
                <option value="HELP">Help</option>
                <option value="THREAD">Thread</option>
                <option value="PATTERN">Pattern</option>
            </select>
        </div>
    </div>
</form>


<button type="button" class="my-button" on:click={createUtility}>Submit</button>

<div class="row mb-3">
</div>

<h1>All Utilities</h1>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Name</th>
            <th>Units</th>
            <th>Utility Types</th>
        </tr>
    </thead>
    <tbody>
        {#each utilities as utility, index}
            <tr
                class="row-tr"
            >
                <td>
                    {index + 1}
                </td>
                <td>
                    {utility.utilityName}
                </td>
                <td>
                    {utility.unit}
                </td>
                <td>
                    {utility.utilityType}
                </td>
                </tr>
        {/each}
        <tr>
            <dt>
                Number of Utilities: {utilities.length}
            </dt>
        </tr>
    </tbody>
</table>

<nav>
    <ul class="pagination">
        {#each Array(nrOfPages) as _, i}
            <li class="page-item">
                <a
                    class="page-link"
                    class:active={currentPage == i + 1}
                    href={"#/utilities?page=" + (i + 1)}
                    >{i + 1}
                </a>
            </li>
        {/each}
    </ul>
</nav>

