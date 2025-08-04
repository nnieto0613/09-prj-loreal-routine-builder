/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const clearAllBtn = document.getElementById("clearAllBtn");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");

/* Array to store selected products */
let selectedProducts = [];

/* Variable to store all products for modal functionality */
let allProductsData = [];

/* Variable to track if a routine has been generated */
let routineGenerated = false;

/* Array to store conversation history for the chatbot */
let conversationHistory = [];

/* localStorage key for saving selected products */
const STORAGE_KEY = "lorealSelectedProducts";

/* Load selected products from localStorage */
function loadSelectedProductsFromStorage() {
  try {
    /* Get saved products from localStorage */
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    if (savedProducts) {
      /* Parse the JSON string back to an array */
      selectedProducts = JSON.parse(savedProducts);
      /* Update the display and button visibility */
      displaySelectedProducts();
      updateGenerateButtonVisibility();
    }
  } catch (error) {
    /* If there's an error reading from localStorage, start with empty array */
    console.error("Error loading products from localStorage:", error);
    selectedProducts = [];
  }
}

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  try {
    /* Convert the array to JSON string and save to localStorage */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProducts));
  } catch (error) {
    /* Log error if localStorage is not available */
    console.error("Error saving products to localStorage:", error);
  }
}

/* Clear all selected products from localStorage */
function clearAllSelectedProducts() {
  /* Empty the selected products array */
  selectedProducts = [];
  /* Remove from localStorage */
  localStorage.removeItem(STORAGE_KEY);
  /* Update the display */
  displaySelectedProducts();
  updateGenerateButtonVisibility();
  /* Clear chat window and reset routine state */
  chatWindow.innerHTML = "";
  routineGenerated = false;
  conversationHistory = [];
  userInput.placeholder = "Ask me about products or routines…";
}

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards with Details and Select buttons */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-card-content">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.brand}</p>
        </div>
      </div>
      <div class="product-buttons">
        <button class="details-btn" data-product-id="${product.id}">Details</button>
        <button class="select-btn" data-product-id="${product.id}">Select</button>
      </div>
    </div>
  `
    )
    .join("");

  /* Add click event listeners to Details buttons */
  const detailsButtons = document.querySelectorAll(".details-btn");
  detailsButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.productId);
      showProductModal(productId);
    });
  });

  /* Add click event listeners to Select buttons */
  const selectButtons = document.querySelectorAll(".select-btn");
  selectButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = parseInt(e.target.dataset.productId);
      addToSelectedProducts(productId, allProductsData);
    });
  });
}

/* Show product details in modal */
function showProductModal(productId) {
  const product = allProductsData.find((p) => p.id === productId);

  /* Create modal HTML */
  const modalHTML = `
    <div id="productModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <img src="${product.image}" alt="${product.name}" class="modal-product-image">
          <div class="modal-product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
          </div>
        </div>
        <div class="modal-description">
          ${product.description}
        </div>
        <div class="modal-buttons">
          <button class="close-btn">Close</button>
          <button class="modal-select-btn" data-product-id="${product.id}">Select Product</button>
        </div>
      </div>
    </div>
  `;

  /* Add modal to page */
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  /* Show modal */
  const modal = document.getElementById("productModal");
  modal.style.display = "block";

  /* Add event listeners for modal */
  const closeBtn = modal.querySelector(".close-btn");
  const modalSelectBtn = modal.querySelector(".modal-select-btn");

  /* Close modal when clicking close button */
  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  /* Select product from modal */
  modalSelectBtn.addEventListener("click", (e) => {
    const productId = parseInt(e.target.dataset.productId);
    addToSelectedProducts(productId, allProductsData);
    closeModal();
  });

  /* Close modal when clicking outside of it */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

/* Close and remove modal */
function closeModal() {
  const modal = document.getElementById("productModal");
  if (modal) {
    modal.remove();
  }
}

/* Add product to selected products list */
function addToSelectedProducts(productId, allProducts) {
  /* Find the product by ID */
  const product = allProducts.find((p) => p.id === productId);

  /* Check if product is already selected */
  if (!selectedProducts.find((p) => p.id === productId)) {
    /* Add product to the array */
    selectedProducts.push(product);
    /* Save to localStorage */
    saveSelectedProductsToStorage();
    /* Update the display */
    displaySelectedProducts();
    /* Update generate button visibility */
    updateGenerateButtonVisibility();
  }
}

/* Display selected products with remove functionality */
function displaySelectedProducts() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = "<p>No products selected yet</p>";
    return;
  }

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
    <div class="selected-product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <div class="remove-overlay">
        <button class="remove-btn" data-product-id="${product.id}">Remove</button>
      </div>
    </div>
  `
    )
    .join("");

  /* Add click event listeners to remove buttons */
  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event bubbling
      const productId = parseInt(e.target.dataset.productId);
      removeFromSelectedProducts(productId);
    });
  });
}

/* Remove product from selected products list */
function removeFromSelectedProducts(productId) {
  /* Filter out the product with the matching ID */
  selectedProducts = selectedProducts.filter(
    (product) => product.id !== productId
  );
  /* Save updated list to localStorage */
  saveSelectedProductsToStorage();
  /* Update the display */
  displaySelectedProducts();
  /* Update generate button visibility */
  updateGenerateButtonVisibility();
}

/* Update generate button visibility based on selected products */
function updateGenerateButtonVisibility() {
  if (selectedProducts.length > 0) {
    generateRoutineBtn.style.display = "block";
    clearAllBtn.style.display = "block";
  } else {
    generateRoutineBtn.style.display = "none";
    clearAllBtn.style.display = "none";
  }
}

/* Generate routine using selected products via Cloudflare worker */
async function generateRoutine() {
  /* Check if any products are selected */
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML =
      "<p>Please select some products first before generating a routine.</p>";
    return;
  }

  /* Show loading message */
  chatWindow.innerHTML = "<p>Generating your personalized routine... ⏳</p>";

  try {
    /* Create system message for routine generation */
    const systemMessage = {
      role: "system",
      content:
        "You are a beauty and skincare expert assistant. Create a personalized routine using the provided products. Include step-by-step instructions, recommended order of use, and helpful tips. Be specific about how to use each product and when to use them (morning/evening). You must ONLY discuss beauty products, skincare routines, makeup, haircare, and related beauty topics like questions having to do with the user's own self (like personal features/preferences). If asked about anything outside of beauty and cosmetics, politely redirect the conversation back to beauty routines and products.",
    };

    /* Create user message for routine generation */
    const userMessage = {
      role: "user",
      content: `Please create a personalized routine using these selected products: ${selectedProducts
        .map(
          (product) =>
            `${product.name} by ${product.brand} - ${product.description}`
        )
        .join(
          "; "
        )}. Please provide detailed steps on how to use these products together effectively.`,
    };

    /* Prepare the request data with selected products */
    const requestData = {
      messages: [systemMessage, userMessage],
    };

    /* Send request to Cloudflare worker */
    const response = await fetch(
      "https://lorealworker.nnieto0613.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    /* Check if response is successful */
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    /* Display the generated routine in chat window */
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      const routine = data.choices[0].message.content;
      chatWindow.innerHTML = `
        <div class="routine-response">
          <h3>Your Personalized Routine</h3>
          <div class="routine-content">${routine.replace(/\n/g, "<br>")}</div>
        </div>
      `;

      /* Add the routine generation to conversation history */
      conversationHistory.push(systemMessage);
      conversationHistory.push(userMessage);
      conversationHistory.push({
        role: "assistant",
        content: routine,
      });

      /* Mark that routine has been generated */
      routineGenerated = true;
      /* Update placeholder text */
      userInput.placeholder = "Ask me about your routine or request changes...";
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error generating routine:", error);
    chatWindow.innerHTML = `
      <p>Sorry, there was an error generating your routine. Please try again.</p>
      <p>Error: ${error.message}</p>
    `;
  }
}

/* Send chat message to Cloudflare worker */
async function sendChatMessage(message) {
  /* Add user message to chat */
  const currentContent = chatWindow.innerHTML;
  chatWindow.innerHTML =
    currentContent +
    `
    <div class="chat-message user-message">
      <strong>You:</strong> ${message}
    </div>
    <div class="chat-message ai-thinking">
      <strong>AI:</strong> Thinking... ⏳
    </div>
  `;

  /* Scroll to bottom of chat */
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    /* Create system message with context about selected products */
    let contextMessage =
      "You are a beauty and skincare expert assistant specialized in helping users with beauty routines, skincare, makeup, haircare, and cosmetic products. You must ONLY answer questions related to beauty, skincare, makeup, haircare, fragrance, and cosmetic routines. If a user asks about anything outside of beauty and cosmetics (such as cooking, sports, politics, general knowledge, etc.), you must politely decline and redirect them back to beauty-related topics. Always respond with something like: 'I'm here to help you with beauty routines and cosmetic products. Let's focus on your skincare, makeup, or haircare needs. Do you have any questions about your routine or the products you've selected?'";

    if (routineGenerated && selectedProducts.length > 0) {
      contextMessage += ` The user has selected these products: ${selectedProducts
        .map((product) => `${product.name} by ${product.brand}`)
        .join(
          ", "
        )}. Help them with questions about their routine or these specific products.`;
    }

    /* Add user message to conversation history */
    const newUserMessage = {
      role: "user",
      content: message,
    };

    /* Build messages array with conversation history */
    const messages = [];

    /* Always start with the system message */
    messages.push({
      role: "system",
      content: contextMessage,
    });

    /* Add all previous conversation history */
    conversationHistory.forEach((historyMessage) => {
      /* Skip system messages from history to avoid duplicates */
      if (historyMessage.role !== "system") {
        messages.push(historyMessage);
      }
    });

    /* Add the current user message */
    messages.push(newUserMessage);

    const requestData = {
      messages: messages,
    };

    /* Send request to Cloudflare worker */
    const response = await fetch(
      "https://lorealworker.nnieto0613.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    /* Remove thinking message and add AI response */
    const thinkingMessage = chatWindow.querySelector(".ai-thinking");
    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      const aiResponse = data.choices[0].message.content;
      chatWindow.innerHTML += `
        <div class="chat-message ai-message">
          <strong>AI:</strong> ${aiResponse.replace(/\n/g, "<br>")}
        </div>
      `;

      /* Add both user message and AI response to conversation history */
      conversationHistory.push(newUserMessage);
      conversationHistory.push({
        role: "assistant",
        content: aiResponse,
      });
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error sending chat message:", error);
    /* Remove thinking message and show error */
    const thinkingMessage = chatWindow.querySelector(".ai-thinking");
    if (thinkingMessage) {
      thinkingMessage.remove();
    }

    chatWindow.innerHTML += `
      <div class="chat-message error-message">
        <strong>Error:</strong> Sorry, I couldn't process your message. Please try again.
      </div>
    `;
  }

  /* Scroll to bottom of chat */
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  /* Store all products data for modal functionality */
  allProductsData = products;

  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Generate Routine button event listener */
generateRoutineBtn.addEventListener("click", generateRoutine);

/* Clear All button event listener */
clearAllBtn.addEventListener("click", () => {
  /* Ask for confirmation before clearing all products */
  if (confirm("Are you sure you want to remove all selected products?")) {
    clearAllSelectedProducts();
  }
});

/* Chat form submission handler for ongoing conversation */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  /* Clear input field */
  userInput.value = "";

  /* Send message to AI */
  await sendChatMessage(message);
});

/* Initialize generate button visibility and load saved products */
updateGenerateButtonVisibility();
/* Load any previously selected products when the page loads */
loadSelectedProductsFromStorage();
