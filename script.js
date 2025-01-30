document.addEventListener("DOMContentLoaded", function () {
    const salesForm = document.getElementById("saleForm");
    const salesTable = document.getElementById("salesTable");
    const monthlyRevenueDisplay = document.getElementById("monthlyRevenue");
    const performanceDisplay = document.getElementById("performance");
    const forecastDisplay = document.getElementById("forecast");
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    function updateSalesTable() {
        salesTable.innerHTML = "";
        let monthlyTotal = 0;
        let currentMonth = new Date().getMonth();

        sales.forEach((sale, index) => {
            if (new Date(sale.date).getMonth() === currentMonth) {
                monthlyTotal += sale.total;
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${sale.productName}</td>
                <td>R$ ${sale.unitPrice.toFixed(2)}</td>
                <td>${sale.quantity}</td>
                <td>R$ ${sale.total.toFixed(2)}</td>
                <td>${sale.date}</td>
                <td><button onclick="removeSale(${index})">Remover</button></td>
            `;
            salesTable.appendChild(row);
        });

        localStorage.setItem("sales", JSON.stringify(sales));
        monthlyRevenueDisplay.textContent = `R$ ${monthlyTotal.toFixed(2)}`;
        updatePerformance(monthlyTotal);
        updateForecast(monthlyTotal);
        updateChart();
    }

    function updatePerformance(monthlyTotal) {
        const pastMonths = sales
            .map(sale => ({ total: sale.total, month: new Date(sale.date).getMonth() }))
            .filter(sale => sale.month !== new Date().getMonth());

        if (pastMonths.length > 0) {
            let pastAverage = pastMonths.reduce((acc, sale) => acc + sale.total, 0) / pastMonths.length;
            if (monthlyTotal > pastAverage * 1.2) {
                performanceDisplay.textContent = "Acima da Média";
                performanceDisplay.style.color = "green";
            } else if (monthlyTotal < pastAverage * 0.8) {
                performanceDisplay.textContent = "Abaixo da Média";
                performanceDisplay.style.color = "red";
            } else {
                performanceDisplay.textContent = "Na Média";
                performanceDisplay.style.color = "orange";
            }
        } else {
            performanceDisplay.textContent = "Sem dados suficientes";
        }
    }

    function updateForecast(monthlyTotal) {
        let forecast = monthlyTotal * 1.1;
        forecastDisplay.textContent = `R$ ${forecast.toFixed(2)}`;
    }

    function addSale(event) {
        event.preventDefault();

        const productName = document.getElementById("productName").value;
        const unitPrice = parseFloat(document.getElementById("unitPrice").value);
        const quantity = parseInt(document.getElementById("quantity").value);
        const total = unitPrice * quantity;
        const date = new Date().toLocaleDateString("pt-BR");

        sales.push({ productName, unitPrice, quantity, total, date });
        updateSalesTable();
        salesForm.reset();
    }

    function removeSale(index) {
        sales.splice(index, 1);
        updateSalesTable();
    }

    function searchProduct() {
        let searchValue = document.getElementById("searchBox").value.toLowerCase();
        salesTable.childNodes.forEach(row => {
            let product = row.childNodes[0].textContent.toLowerCase();
            row.style.display = product.includes(searchValue) ? "" : "none";
        });
    }

    function exportCSV() {
        let csv = "Produto,Preço Unitário,Quantidade,Total,Data\n";
        sales.forEach(sale => {
            csv += `${sale.productName},${sale.unitPrice},${sale.quantity},${sale.total},${sale.date}\n`;
        });

        let hiddenElement = document.createElement("a");
        hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        hiddenElement.target = "_blank";
        hiddenElement.download = "vendas.csv";
        hiddenElement.click();
    }

    salesForm.addEventListener("submit", addSale);
    updateSalesTable();
});
