document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("graficoPizza").getContext("2d");

  const data = {
    labels: categorias,
    datasets: [{
      label: "Gastos por Categoria",
      data: totais,
      backgroundColor: [
        "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1",
        "#14b8a6", "#f43f5e", "#a855f7", "#84cc16", "#ec4899"
      ],
      borderColor: "#ffffff",
      borderWidth: 2
    }]
  };

  const config = {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#374151",
            padding: 20,
            boxWidth: 20
          }
        },
        tooltip: {
          callbacks: {
            label: context => {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label}: R$ ${value.toFixed(2)}`;
            }
          }
        }
      }
    }
  };

  new Chart(ctx, config);
});
