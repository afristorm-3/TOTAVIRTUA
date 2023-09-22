// Get a reference to the textarea element
const textarea = document.getElementById("user-input");

// Add an event listener to the textarea to adjust its rows as the user types
textarea.addEventListener("input", function () {
  // Calculate the number of rows based on the content's scrollHeight
  const rows = Math.min(7, this.scrollHeight / 20); // Adjust the divisor for your font size

  // Set the rows attribute to the calculated value
  this.rows = rows;
});
