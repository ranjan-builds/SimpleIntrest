document.addEventListener("DOMContentLoaded", function () {
  const principalInput = document.getElementById("principal");
  const rateInput = document.getElementById("rate");
  const rateValue = document.getElementById("rate-value");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");
  const calculateBtn = document.getElementById("calculate-btn");
  const downloadBtn = document.getElementById("download-btn");

  // Result elements
  const resultPrincipal = document.getElementById("result-principal");
  const resultRate = document.getElementById("result-rate");
  const resultTime = document.getElementById("result-time");
  const resultInterest = document.getElementById("result-interest");
  const resultDays = document.getElementById("result-days");
  const resultTotal = document.getElementById("result-total");
  const copyrightyear = document.getElementById("copyrightyear");

  // Update rate value display
  rateInput.addEventListener("input", function () {
    rateValue.textContent = this.value + "%";
  });

  // Calculate interest
  calculateBtn.addEventListener("click", calculateInterest);

  // Set default dates (today and 1 year from now)
  const today = new Date();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);
  copyrightyear.innerText = today.getFullYear()
  
  calculateBtn.addEventListener("click", calculateInterest);

  function calculateInterest() {
    const principal = parseFloat(principalInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const { months, days } = getMonthDayDiff(startDate, endDate);

    // Calculate simple interest
    const dailyIntrest = (principal * rate * (days / 30)) / 100;
    const interest = (principal * rate * months) / 100;
    const total = principal + interest;
    console.log(dailyIntrest);
    // Update results
    resultPrincipal.textContent = "₹" + formatIndianCurrency(principal);
    resultRate.textContent = rate + "%";
    // Format dates for display
    const options = { year: "numeric", month: "short", day: "numeric" };
    resultTime.textContent = `${startDate.toLocaleDateString(
      "en-GB",
      options
    )} to ${endDate.toLocaleDateString(
      "en-GB",
      options
    )} (${months} months ${days} days)`;

    resultInterest.textContent = "₹" + formatIndianCurrency(interest);
    resultDays.textContent = "₹" + formatIndianCurrency(dailyIntrest);
    resultTotal.textContent = "₹" + formatIndianCurrency(total);

    // Add animation to results
    const resultCard = document.querySelector(".result-card");
    resultCard.classList.add("animate-pulse");
    setTimeout(() => {
      resultCard.classList.remove("animate-pulse");
    }, 300);
  }

  function getMonthDayDiff(startDate, endDate) {
    // Ensure startDate is before endDate
    if (endDate < startDate) [startDate, endDate] = [endDate, startDate];

    let start = new Date(startDate);
    let end = new Date(endDate);

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    let dayDiff = end.getDate() - start.getDate();

    if (dayDiff < 0) {
      // Move one month back
      months--;
      let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      dayDiff = prevMonth.getDate() + dayDiff;
    }

    return { months, days: dayDiff };
  }

  //currency formatter
  function formatIndianCurrency(amount) {
    return Number(amount).toLocaleString("en-IN");
  }

  // Download results as image
  downloadBtn.addEventListener("click", function () {
    const resultCard = document.querySelector(".result-card");

    html2canvas(resultCard, {
      backgroundColor: null, // Makes background transparent
      scale: 2, // Improves quality (default is 1)
      useCORS: true, // Allows loading external images/fonts (if needed)
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "interest_calculation.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
});
