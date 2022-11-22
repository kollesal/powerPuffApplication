<script>
	import Router from "svelte-spa-router";
	import routes from "./routes";
</script>

<div id="app">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<a class="navbar-brand" href="/#">Navbar</a>
	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
	  <span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavDropdown">
	  <ul class="navbar-nav">
		<li class="nav-item active">
		  <a class="nav-link" href="/#">Home <span class="sr-only">(current)</span></a>
		</li>
		
		<li class="nav-item dropdown">
		  <a class="nav-link dropdown-toggle" href="/#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			View
		  </a>
		  <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
			<a class="dropdown-item" href="/#/products">Products</a>
			<a class="dropdown-item" href="/#/users">Users</a>
			<a class="dropdown-item" href="/#">Something else here</a>
		  </div>
		</li>
	  </ul>
	</div>
  </nav>
  <!-- Navbar -->





<!--

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
			<div class="collapse navbar-collapse" id="navbarNavDropdown">
				<ul class="navbar-nav">
					<li class="nav-item">
						<a class="navbar-brand" href="/#">
						<img src="/images/home.png" width="30" height="30" class="d-inline-block align-top" alt=""/>
					</a>
					</li>
					<li class="nav-item">
						<a
							class="nav-link"
							aria-current="page"
							href="/#">Home</a
						>
					</li>

					<li class="nav-item dropdown">
						<a class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							View
						  </a>
						  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
							<a class="dropdown-item" href="#/products">Products</a>
							<a class="dropdown-item" href="#/users">Users</a>
							<a class="dropdown-item" href="#/utilities">Utilities</a>
						  </div>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#/users">Create</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#/utilities">Analytics</a>
					</li>
				</ul>
			</div>
		</div>
	</nav>
-->

	<div class="container">
		<Router {routes} />
	</div>
</div>
