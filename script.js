$(document).ready(function () {
  let inventoryData = [];
  const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSAMKDzn__j8mtkOKROehB4CPQuIpw0zLnEwRQgjbL09_3ElbkMhkWAg31CDzzypxOiF3Cp8UHrxQ8u/pub?output=csv';

  fetchCsvData().then(() => {
    initialize();
  });

  function fetchCsvData() {
    return fetch(googleSheetUrl)
      .then(response => response.text())
      .then(parseCsvData)
      .then(data => {
        inventoryData = data;
      });
  }

  function parseCsvData(csvData) {
    const parsedData = Papa.parse(csvData, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transform: (value, header) => {
        if (header === 'Price') {
          return parseFloat(value.replace(/[$,]/g, ''));
        } else {
          return value;
        }
      },
    });

    return parsedData.data;
  }

  function filterDataByDescriptionKeywords(data, keywords) {
    return data.filter(item => {
      return keywords.every(keyword => {
        return item.Description.toLowerCase().includes(keyword) || item.Part.toLowerCase().includes(keyword);
      });
    });
  }

  function populateSearchResultsDropdown(items) {
    const searchResultsDropdown = $('.search-results-dropdown');
    searchResultsDropdown.empty();
    searchResultsDropdown.append('<option value="">Select Item</option>');

    items.forEach(item => {
      searchResultsDropdown.append(`<option value="${item.Part}">${item.Description}</option>`);
    });
  }

  function addEditableRow(item) {
    const newRow = $('<tr></tr>');
    const partInput = $('<input type="text" class="item-part-input" value="' + item.Part + '">');
    const description = $('<td class="item-description">' + item.Description + '</td>');
    const price = $('<td class="item-price">' + item.Price.toFixed(2) + '</td>');
    const quantity = $('<input type="number" class="item-quantity" min="1" value="1">');
    const total = $('<td class="item-total">' + item.Price.toFixed(2) + '</td>');
    const date = $('<input type="date" class="item-date">');
    const notes = $('<input type="text" class="item-notes">');
    const removeButton = $('<button class="remove-row">Remove</button>');

    newRow.append($('<td></td>').append(partInput));
    newRow.append(description);
    newRow.append(price);
    newRow.append($('<td></td>').append(quantity));
    newRow.append(total);
    newRow.append($('<td></td>').append(date));
    newRow.append($('<td></td>').append(notes));
    newRow.append($('<td></td>').append(removeButton));

    $('.order-table tbody').append(newRow);
    updateGrandTotal();
    bindRowEvents();
  }

    function updateGrandTotal() {
    let grandTotal = 0;
    $('.order-table tbody tr').each(function () {
      const price = parseFloat($(this).find('.item-price').text());
      const quantity = parseInt($(this).find('.item-quantity').val());
      const total = price * quantity;
      grandTotal += total;
      $(this).find('.item-total').text(total.toFixed(2));
    });
    $('.grand-total').text(grandTotal.toFixed(2));
  }

  function bindRowEvents() {
    $('.order-table').off('change', '.item-quantity');
    $('.order-table').on('change', '.item-quantity', function () {
      const row = $(this).closest('tr');
      const price = parseFloat(row.find('.item-price').text());
      const quantity = parseInt($(this).val());
      const total = price * quantity;
      row.find('.item-total').text(total.toFixed(2));
      updateGrandTotal();
    });

    $('.order-table').off('change', '.item-part-input');
    $('.order-table').on('change', '.item-part-input', function () {
      const row = $(this).closest('tr');
      const selectedItemPart = $(this).val();
      const selectedItem = inventoryData.find(item => item.Part === selectedItemPart);

      if (selectedItem) {
        row.find('.item-description').text(selectedItem.Description);
        row.find('.item-price').text(selectedItem.Price.toFixed(2));
        row.find('.item-quantity').val(1);
        row.find('.item-total').text(selectedItem.Price.toFixed(2));
      } else {
        row.find('.item-description').text('');
        row.find('.item-price').text('');
        row.find('.item-quantity').val(1);
        row.find('.item-total').text('');
      }

      updateGrandTotal();
    });

    $('.order-table').off('click', '.remove-row');
    $('.order-table').on('click', '.remove-row', function () {
      $(this).closest('tr').remove();
      updateGrandTotal();
    });
  }

  function initialize() {
  $('.search-input').on('keyup', function () {
    const searchKeywords = $(this).val().toLowerCase().trim().split(' ');
    if (searchKeywords.length > 0 && searchKeywords[0] !== '') {
      const filteredData = filterDataByDescriptionKeywords(inventoryData, searchKeywords);
      populateSearchResultsDropdown(filteredData);
    } else {
      $('.search-results-dropdown').empty();
      $('.search-results-dropdown').append('<option value="">Select Item</option>');
    }
  });

  $('.search-results-dropdown').on('change', function () {
    const selectedItemPart = $(this).val();
    if (selectedItemPart !== '') {
      const selectedItem = inventoryData.find(item => item.Part === selectedItemPart);
      addEditableRow(selectedItem);
      $(this).val(""); // Reset the dropdown to prevent duplicate rows
    }
  });

  $('.add-row').on('click', function () {
    const emptyItem = { Part: '', Description: '', Price: 0 };
    addEditableRow(emptyItem);
  });

  $('.submit-order').on('click', function () {
    // Add your desired action here when the order is submitted
    alert('Request submitted -super-easy, super-fast, super-duper!');
  });

  bindRowEvents();
  updateGrandTotal();
}

//initialize();

});
