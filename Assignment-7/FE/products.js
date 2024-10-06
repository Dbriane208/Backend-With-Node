let events = [];
let cartProducts = [];
const apiBaseUrl = 'http://127.0.0.1:8004/api/product';

// Fetch event data using async/await
const fetchEventData = async () => {
  try {
    const res = await fetch(apiBaseUrl); // Await fetch response
    const data = await res.json(); // Await for the response to be converted to JSON
    console.log(data);
    events = data; // Store fetched data in events
    displayEvents(events); // Display events initially
  } catch (error) {
    console.error("Error fetching data:", error); // Handle any errors that occur during fetch
  }
};

// Call the function to fetch and display events
fetchEventData();

document.addEventListener('DOMContentLoaded', function() {
  const addEventModal = document.getElementById('editModal');
  const addItemBtn = document.getElementById('addItemBtn');
  const closeSpan = document.querySelector('#editModal .close');
  const editProductForm = document.getElementById('editProductForm');

  // Open modal
  addItemBtn.addEventListener('click', function() {
    addEventModal.style.display = 'block';
    // Clear the form when opening for a new event
    editProductForm.reset();
    // Change the form title to indicate we're adding a new event
    document.querySelector('#editModal h2').textContent = 'Add New Event';
  });

  // Close modal
  closeSpan.addEventListener('click', function() {
    addEventModal.style.display = 'none';
  });

  // Close modal if clicked outside
  window.addEventListener('click', function(event) {
    if (event.target == addEventModal) {
      addEventModal.style.display = 'none';
    }
  });

  // Form submission
  editProductForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submitted'); // Debug log

    const newEvent = {
      imageUrl: document.getElementById('editImageUrl').value,
      title: document.getElementById('editTitle').value,
      price: parseFloat(document.getElementById('editPrice').value),
      date: document.getElementById('editDate').value,
      location: document.getElementById('editLocation').value,
      company: document.getElementById('editCompany').value
    };

    console.log('New event data:', newEvent); // Debug log

    try {
      await addNewEvent(newEvent);
      addEventModal.style.display = 'none';
      this.reset(); // Reset the form after submission
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  });
});

const addNewEvent = async (newEvent) => {
  try {
    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create event');
    }

    const createdEvent = await response.json();
    console.log('Created event:', createdEvent); // Debug log
    await fetchEventData(); // Refresh the events list
  } catch (error) {
    console.error('Error in addNewEvent:', error);
    throw error; // Re-throw to be caught in the submit event listener
  }
};

function displayEvents(events) {
  const container = document.getElementById("container");
  container.innerHTML = ""; // Clear existing events

  events.forEach((event) => {
    const card = document.createElement("div");
    card.className = "main";
    container.appendChild(card);

    const img = document.createElement("img");
    img.src = event.imageUrl;
    card.appendChild(img);

    const info = document.createElement("div");
    info.className = "info";
    card.appendChild(info);

    const title = document.createElement("h3");
    title.textContent = event.title;
    info.appendChild(title);

    const date = document.createElement("p");
    date.textContent = event.date;
    info.appendChild(date);

    const company = document.createElement("p");
    company.textContent = event.company;
    info.appendChild(company);

    const price = document.createElement("p");
    price.textContent = `Ksh ${event.price}`;
    info.appendChild(price);

    // Create a container for buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = 'button-container';
    info.appendChild(buttonContainer);

    const editButton = document.createElement("button");
    editButton.textContent = 'Edit';
    editButton.className = 'buttons';
    editButton.style.backgroundColor = "#28a745"
    buttonContainer.appendChild(editButton);

    const addButton = document.createElement("button");
    addButton.textContent = 'Add to Cart';
    addButton.className = 'buttons';
    buttonContainer.appendChild(addButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = 'Delete';
    deleteButton.style.backgroundColor = "#dc3545"
    deleteButton.className = 'buttons';
    buttonContainer.appendChild(deleteButton);

    addButton.addEventListener('click', () => {
      addProductToCart(event); // Call the function to add the product to the cart
    });

    editButton.addEventListener('click', () => {
      editProduct(event); // Call the editProduct function with the product index
    });

    deleteButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this event?')) {
        try {
          await deleteEvent(event.id);
          // The event list will be refreshed by fetchEventData() in deleteEvent function
        } catch (error) {
          console.error('Error deleting event:', error);
          showNotification('Failed to delete event', true);
        }
      }
    });
  });
};


// Filtering function
document.getElementById("priceFilter").addEventListener("change", filterEvents);
function filterEvents() {
  const price = document.getElementById("priceFilter").value;
  console.log("Selected price filter:", price);

  let filteredOutput = events;

  if (price === "low") {
    filteredOutput = events.filter((event) => event.price <= 25);
  } else if (price === "high") {
    filteredOutput = events.filter((event) => event.price > 25);
  }

  displayEvents(filteredOutput);
}

// Sorting function
function sortEvents(criteria, order) {
  const sortedEvents = [...events].sort((a, b) => {
    let valA = a[criteria];
    let valB = b[criteria];

    if (criteria === 'date') {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (!valA) valA = criteria === 'price' ? 0 : new Date(0);
    if (!valB) valB = criteria === 'price' ? 0 : new Date(0);

    return order === 'asc' ? valA - valB : valB - valA; 
  });

  displayEvents(sortedEvents);
}

const addProductToCart = function (product) {
  const cartDiv = document.getElementById('cartDiv');

  // Find if the product is already in the cart
  const existingProductIndex = cartProducts.findIndex(item => item.id === product.id);

  if (existingProductIndex !== -1) {
      // If product exists, increment the quantity
      cartProducts[existingProductIndex].quantity += 1;
  } else {
      // Add new product with quantity set to 1, ensure product is valid
      if (product && product.id) {
          product.quantity = 1;
          cartProducts.push(product);
      }
  }

  refreshCart(); // Refactored refresh to only update the display
};

// Function to remove the product from the cart
const removeProductFromCart = function (index) {
  cartProducts.splice(index, 1); // Remove the product at the specified index
  refreshCart(); // Refresh the cart
};

// Function to refresh the cart display
const refreshCart = function () {
  const cartDiv = document.getElementById('cartDiv');
  cartDiv.innerHTML = ''; // Clear the cart display

  cartProducts.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';

      const img = document.createElement('img');
      img.src = item.imageUrl;
      cartItem.appendChild(img);

      const info = document.createElement('div');
      info.className = "info-cart";
      cartItem.appendChild(info);

      const title = document.createElement('h4');
      title.textContent = item.title;
      info.appendChild(title);

      const date = document.createElement('p');
      date.textContent = item.date;
      info.appendChild(date);

      const company = document.createElement('p');
      company.textContent = item.company;
      info.appendChild(company);

      const price = document.createElement('p');
      price.textContent = `Ksh ${item.price}`;
      info.appendChild(price);

      const btnDiv = document.createElement('div');
      btnDiv.className = 'btn-div';
      info.appendChild(btnDiv);

      // Increment and Decrement buttons
      const incDec = document.createElement("div");
      incDec.className = 'incDec';
      btnDiv.appendChild(incDec);

      const sub = document.createElement("button");
      sub.textContent = '-';
      sub.style.borderRadius = "15px";
      sub.style.margin = "5px";
      sub.className = 'btn';
      sub.addEventListener('click', () => {
          if (item.quantity > 1) {
              item.quantity -= 1;
          } else {
              removeProductFromCart(index); // Remove if quantity is 1
          }
          refreshCart(); // Update cart after decrement
      });
      incDec.appendChild(sub);

      const num = document.createElement("p");
      num.textContent = item.quantity;
      incDec.appendChild(num);

      const add = document.createElement("button");
      add.textContent = '+';
      add.style.borderRadius = "15px";
      add.style.margin = "5px";
      add.className = 'btn';
      add.addEventListener('click', () => {
          item.quantity += 1;
          refreshCart(); // Update cart after increment
      });
      incDec.appendChild(add);

      // Delete button functionality
      const deleteButton = document.createElement("button");
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'buttons';
      deleteButton.addEventListener('click', () => {
          removeProductFromCart(index); // Call the remove function
      });
      btnDiv.appendChild(deleteButton);

      // Append the new cart item to the cart container
      cartDiv.appendChild(cartItem);
  });

  // Update the total price
  updateTotalPrice();
};

// Function to calculate and display the total price
const updateTotalPrice = function () {
  const totalPriceDiv = document.getElementById('totalPriceDiv'); // Div to display total price

  let totalPrice = 0;

  cartProducts.forEach(item => {
      totalPrice += item.price * item.quantity;
  });

  totalPriceDiv.textContent = `Total Price: Ksh ${totalPrice}`;
};

const editProduct = async function(event) {
  // Get the modal and form elements
  const editModal = document.getElementById('editModal');
  const editTitle = document.getElementById('editTitle');
  const editDate = document.getElementById('editDate');
  const editCompany = document.getElementById('editCompany');
  const editPrice = document.getElementById('editPrice');
  const editLocation = document.getElementById('editLocation');
  const editImageUrl = document.getElementById('editImageUrl');
  const editProductForm = document.getElementById('editProductForm');

  // Show the modal
  editModal.style.display = 'block';

  // Pre-fill the form with the current product data
  editTitle.value = event.title || '';
  editDate.value = event.date || '';
  editCompany.value = event.company || '';
  editPrice.value = event.price || '';
  editLocation.value = event.location || '';
  editImageUrl.value = event.imageUrl || '';

  // Handle form submission
  editProductForm.onsubmit = async function(e) {
    e.preventDefault();

    const updatedEvent = {
      title: editTitle.value,
      date: editDate.value,
      company: editCompany.value,
      price: Number(editPrice.value),
      location: editLocation.value,
      imageUrl: editImageUrl.value
    };

    try {
      const response = await fetch(`${apiBaseUrl}/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });

      if (response.ok) {
        fetchEventData(); // Refresh the events list
        editModal.style.display = 'none';
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update event', true);
      }
    } catch (error) {
      showNotification('Failed to update event', true);
      console.error(error);
    }
  };

  // Close modal functionality
  const closeModal = document.getElementById('closeModal');
  closeModal.onclick = function() {
    editModal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === editModal) {
      editModal.style.display = 'none';
    }
  };
};

const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${apiBaseUrl}/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showNotification('Event deleted successfully');
      fetchEventData(); // Refresh the events list
    } else {
      const error = await response.json();
      showNotification(error.message || 'Failed to delete event', true);
    }
  } catch (error) {
    showNotification('Failed to delete event', true);
    console.error(error);
  }
};

// Initial rendering of total price container
document.addEventListener('DOMContentLoaded', () => {
  const cartDiv = document.getElementById('cartDiv');
  const totalPriceDiv = document.createElement('div');
  totalPriceDiv.id = 'totalPriceDiv';

  totalPriceDiv.textContent = 'Total Price: Ksh 0';
  totalPriceDiv.style.backgroundColor = "rgb(68, 216, 226)";
  totalPriceDiv.style.height ="70px"
  totalPriceDiv.style.alignContent ="center";
  totalPriceDiv.style.fontWeight ="bold";
  totalPriceDiv.style.color = "white";
  cartDiv.parentElement.appendChild(totalPriceDiv); 
});