<script>
	import Router from "svelte-spa-router";
	import routes from "./routes";
</script>

<div id="app">
	<nav class="navbar navbar-expand-lg bg-light">
		<div class="container-fluid">
			<a class="navbar-brand" href="#/">Power Puff</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNav"
				aria-controls="navbarNav"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav">
					<li class="nav-item">
						<a
							class="nav-link"
							aria-current="page"
							href="#/products">Products</a
						>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#/users">Users</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#/utilities">Utilities</a>
					</li>
				</ul>
			</div>
		</div>
	</nav>

	<div class="container">
		<Router {routes} />
	</div>
</div>
