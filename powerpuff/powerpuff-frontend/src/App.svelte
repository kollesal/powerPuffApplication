<script>
	import Router from "svelte-spa-router";
	import routes from "./routes";
	import { isAuthenticated, user } from "./store";
	import auth from "./auth.service";
</script>

<div id="app">
	<!-- Navbar -->
	<nav class="navbar navbar-expand-lg bg-light">
		<div class="container-fluid">
			<a class="navbar-brand" href="#/">Power Puff</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNavDropdown"
				aria-controls="navbarNavDropdown"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>

			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav me-auto mb-2 mb-lg-0">
					{#if $isAuthenticated}
						<li class="nav-item">
							<a class="navbar-brand" href="/#">
								<img
									src="/images/home.png"
									width="30"
									height="30"
									class="d-inline-block align-top"
									alt=""
								/>
							</a>
						</li>
					{/if}
					
					<li class="nav-item">
						<a class="nav-link" href="#/products">Products</a>
					</li>
					{#if $isAuthenticated && $user.user_roles.includes("admin")}
						<li class="nav-item">
							<a class="nav-link" href="#/users">Users</a>
						</li>
					{/if}
					{#if $isAuthenticated}
						<li class="nav-item">
							<a class="nav-link" href="#/utilities">Utilities</a>
						</li>
					{/if}
				</ul>
				<div class="d-flex">
					{#if $isAuthenticated}
						<span class="navbar-text me-2">
							<a class="nav-link" href="#/account">{$user.name}</a>
						</span>
						<button
							type="button"
							class="btn btn-primary"
							on:click={auth.logout}>Log Out</button
						>
					{:else}
						<button
							type="button"
							class="btn btn-primary"
							on:click={auth.loginWithPopup}>Log In</button
						>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<div class="container">
		<Router {routes} />
	</div>
</div>
