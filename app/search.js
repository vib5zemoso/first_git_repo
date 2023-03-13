function searchMenu() {
  const searchInput = document.getElementById("search-menu");
  let filterValue = searchInput.value.toUpperCase();
  for (let i = 0; i < products.length; i++) {
      if (products[i].title.toUpperCase().indexOf(filterValue) > -1) {
          document.getElementById(i).style.display = "";
      } else {
          document.getElementById(i).style.display = "none";
      }
  }
}