 
      document.addEventListener("DOMContentLoaded", function () {
        // Input Elements
        const principalInput = document.getElementById("principal");
        const rateInput = document.getElementById("rate");
        const rateValue = document.getElementById("rate-value");
        const startDateInput = document.getElementById("start-date");
        const startDateText = document.getElementById("start-date-text");
        const endDateInput = document.getElementById("end-date");
        const endDateText = document.getElementById("end-date-text");
        
        // Buttons
        const calculateBtn = document.getElementById("calculate-btn");
        const downloadBtn = document.getElementById("download-btn");

        // Result Elements
        const resultPrincipal = document.getElementById("result-principal");
        const resultRate = document.getElementById("result-rate");
        const resultDurationText = document.getElementById("result-duration-text");
        const resultDateRange = document.getElementById("result-date-range");
        const result1MonthInterest = document.getElementById("result-1-month");
        const resultInterestMonths = document.getElementById("result-interest-months");
        const resultInterestDays = document.getElementById("result-interest-days");
        const resultTotalInterest = document.getElementById("result-total-interest");
        const resultTotal = document.getElementById("result-total");
        
        // Year setup
        const copyrightyear = document.getElementById("copyrightyear");
        const today = new Date();
        copyrightyear.innerText = today.getFullYear();

        // Principal Input Formatting Logic
        const formatPrincipal = (value) => {
          const cleanValue = value.toString().replace(/\D/g, '');
          if (!cleanValue) return '';
          return new Intl.NumberFormat('en-IN').format(parseInt(cleanValue, 10));
        };

        principalInput.addEventListener('input', (e) => {
          // Track cursor to prevent jumping
          let cursor = e.target.selectionStart;
          let oldLen = e.target.value.length;
          
          e.target.value = formatPrincipal(e.target.value);
          
          // Restore cursor
          let newLen = e.target.value.length;
          cursor += (newLen - oldLen);
          e.target.setSelectionRange(cursor, cursor);
          
          calculateInterest();
        });

        // Date Masking Logic (DD/MM/YYYY)
        const parseDDMMYYYY = (str) => {
          const parts = str.split('/');
          if (parts.length === 3 && parts[2].length === 4) {
             const d = parseInt(parts[0], 10);
             const m = parseInt(parts[1], 10);
             const y = parseInt(parts[2], 10);
             
             // Validate date logic (e.g., handles leap years, rejects 31/02)
             const testDate = new Date(y, m - 1, d);
             if (testDate.getFullYear() === y && testDate.getMonth() === m - 1 && testDate.getDate() === d) {
                return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
             }
          }
          return null;
        };

        const syncDateInputs = (textInput, dateInput) => {
          // Text -> Date
          textInput.addEventListener('input', (e) => {
            let cursor = textInput.selectionStart;
            let oldLen = textInput.value.length;

            // Only apply mask if we are typing normally (ignore backspace to allow smooth deletion)
            if (e.inputType !== 'deleteContentBackward') {
              let v = textInput.value.replace(/\D/g, ''); 
              if (v.length > 8) v = v.substring(0, 8);
              
              let formatted = v;
              if (v.length >= 5) {
                formatted = `${v.substring(0,2)}/${v.substring(2,4)}/${v.substring(4,8)}`;
              } else if (v.length >= 3) {
                formatted = `${v.substring(0,2)}/${v.substring(2)}`;
              }
              
              textInput.value = formatted;
              
              // Keep cursor aligned correctly
              let newLen = textInput.value.length;
              cursor += (newLen - oldLen);
              textInput.setSelectionRange(cursor, cursor);
            }

            const parsedDate = parseDDMMYYYY(textInput.value);
            if (parsedDate) {
              dateInput.value = parsedDate;
              calculateInterest();
            }
          });
          
          // Date -> Text
          dateInput.addEventListener('change', (e) => {
            if (e.target.value) {
              const [y, m, d] = e.target.value.split('-');
              textInput.value = `${d}/${m}/${y}`;
              calculateInterest();
            }
          });
        };

        // Initialize 2-way sync for both date fields
        syncDateInputs(startDateText, startDateInput);
        syncDateInputs(endDateText, endDateInput);

        // Utility: Format Currency robustly
        const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(amount);
        };

        // Utility: Date formatter for display
        const formatDateForDisplay = (date) => {
          return date.toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric' 
          });
        };

        // Event Listeners
        rateInput.addEventListener("input", function () {
          rateValue.textContent = this.value + "%";
        });

        // Trigger calculation on input changes for a responsive feel
        const inputs = [principalInput, rateInput];
        inputs.forEach(input => {
          input.addEventListener('change', calculateInterest);
        });
        rateInput.addEventListener('input', calculateInterest);

        calculateBtn.addEventListener("click", calculateInterest);

        // Core Calculation Logic
        function calculateInterest() {
          const rawPrincipal = principalInput.value.replace(/,/g, '');
          const principal = parseFloat(rawPrincipal) || 0;
          const rate = parseFloat(rateInput.value) || 0;
          
          // Always update Principal and Rate even if dates are missing
          resultPrincipal.textContent = formatCurrency(principal);
          resultRate.textContent = rate.toFixed(1) + "%";

          if(!startDateInput.value || !endDateInput.value) {
            resultDurationText.textContent = "0 Months";
            resultDateRange.textContent = "-- to --";
            result1MonthInterest.textContent = "₹0.00";
            resultInterestMonths.textContent = "₹0.00";
            resultInterestDays.textContent = "₹0.00";
            resultTotalInterest.textContent = "₹0.00";
            resultTotal.textContent = formatCurrency(principal); // Total is just principal without time
            return;
          }

          let startDate = new Date(startDateInput.value);
          let endDate = new Date(endDateInput.value);
          
          // Ensure chronological order
          if (endDate < startDate) {
            [startDate, endDate] = [endDate, startDate];
          }

          const { months, days } = getMonthDayDiff(startDate, endDate);

          // Calculations
          const oneMonthInterestAmount = (principal * rate) / 100;
          const monthlyInterestAmount = (principal * rate * months) / 100;
          // Standardizing a month to 30 days for pro-rata calculation typical in simple commercial interest
          const dailyInterestAmount = (principal * rate * (days / 30)) / 100; 
          
          const totalInterest = monthlyInterestAmount + dailyInterestAmount;
          const totalAmount = principal + totalInterest;

          // Update UI
          let durationStr = [];
          if (months > 0) durationStr.push(`${months} Month${months > 1 ? 's' : ''}`);
          if (days > 0 || months === 0) durationStr.push(`${days} Day${days !== 1 ? 's' : ''}`);
          
          resultDurationText.textContent = durationStr.join(', ');
          resultDateRange.textContent = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;

          result1MonthInterest.textContent = formatCurrency(oneMonthInterestAmount);
          resultInterestMonths.textContent = formatCurrency(monthlyInterestAmount);
          resultInterestDays.textContent = formatCurrency(dailyInterestAmount);
          resultTotalInterest.textContent = formatCurrency(totalInterest);
          
          resultTotal.textContent = formatCurrency(totalAmount);

          // Trigger subtle animation on the receipt card
          const receiptCard = document.getElementById("receipt-capture-area");
          receiptCard.classList.remove("scale-[1.02]", "shadow-glow-blue");
          void receiptCard.offsetWidth; // trigger reflow
          receiptCard.classList.add("scale-[1.02]", "shadow-glow-blue", "transition-all", "duration-300");
          setTimeout(() => {
            receiptCard.classList.remove("scale-[1.02]", "shadow-glow-blue");
          }, 300);
        }

        // Logic to extract precise Months and Days difference
        function getMonthDayDiff(start, end) {
          let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          let dayDiff = end.getDate() - start.getDate();

          if (dayDiff < 0) {
            months--;
            // Get days in the previous month relative to 'end' date
            let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            dayDiff = prevMonth.getDate() + dayDiff;
          }
          return { months, days: dayDiff };
        }

        // Initial Calculation on load
        calculateInterest();

        // Download functionality using html2canvas
        downloadBtn.addEventListener("click", function () {
          const originalBtnContent = this.innerHTML;
          this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
          this.disabled = true;

          const captureArea = document.getElementById("receipt-capture-area");
          
          html2canvas(captureArea, {
            backgroundColor: '#1E1F20', // Matches app-card for a clean export
            scale: 2, 
            logging: false,
            useCORS: true, 
            windowWidth: captureArea.scrollWidth,
            windowHeight: captureArea.scrollHeight
          }).then((canvas) => {
            const link = document.createElement("a");
            link.download = `YieldCalc_Statement_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            
            // Restore button
            this.innerHTML = originalBtnContent;
            this.disabled = false;
          }).catch(err => {
            console.error("Error capturing receipt:", err);
            this.innerHTML = originalBtnContent;
            this.disabled = false;
            alert("Failed to export image. Please try again.");
          });
        });
      });
    