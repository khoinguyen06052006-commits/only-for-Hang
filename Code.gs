/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT - HỆ THỐNG LƯU TIN NHẮN & TƯƠNG TÁC THIỆP TÌNH YÊU
 * Cập nhật cấu hình 6 cột:
 * Cột A: Thời gian gửi
 * Cột B: Ngày của thiệp
 * Cột C: Nội dung tin nhắn
 * Cột D: Lượt gửi ôm
 * Cột E: Điều muốn làm hôm nay
 * Cột F: Trạng thái (Mặc định: "Chờ xử lý")
 *
 * Dán toàn bộ mã này vào: Tiện ích mở rộng (Extensions) > Apps Script trong Google Sheet
 * ==============================================================================
 */

const SHEET_NAME = "Trang tính1";
const HEADER_ROW = 5;       // Hàng 5 đặt tiêu đề cột
const START_DATA_ROW = 6;   // Dữ liệu tin nhắn ghi từ Hàng 6 trở xuống

/**
 * Xử lý khi website gửi dữ liệu đến (POST request)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Khóa đồng thời tránh xung đột khi nhiều người gửi cùng lúc

  try {
    var sheet = getTargetSheet();
    var payload = extractPayload(e);

    var cardDate = payload.cardDate || payload.date || "Không xác định";
    var message = payload.message || payload.text || "";
    var hugCount = payload.hugCount !== undefined && payload.hugCount !== null ? Number(payload.hugCount) : 0;
    var todayWish = payload.todayWish || "Không chọn";

    if (!message || message.trim() === "") {
      return respondJSON({
        status: "error",
        message: "Nội dung tin nhắn không được để trống!"
      });
    }

    // 1. Kiểm tra và tự động cập nhật dòng tiêu đề ở Hàng 5 (A5:F5)
    ensureHeaders(sheet);

    // 2. Tìm dòng trống tiếp theo bắt đầu từ Hàng 6 trở xuống
    var nextRow = findNextAvailableRow(sheet);

    // 3. Lấy thời gian gửi theo giờ Việt Nam (GMT+7)
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm:ss dd/MM/yyyy");

    // 4. Chuẩn bị dữ liệu ghi vào 6 cột:
    // Cột A: Thời gian gửi
    // Cột B: Ngày của thiệp
    // Cột C: Nội dung tin nhắn
    // Cột D: Lượt gửi ôm
    // Cột E: Điều muốn làm hôm nay
    // Cột F: Trạng thái (Mặc định: "Chờ xử lý")
    var rowData = [
      timestamp,
      cardDate,
      message.trim(),
      hugCount,
      todayWish,
      "Chờ xử lý"
    ];

    // Ghi dữ liệu vào hàng tiếp theo
    sheet.getRange(nextRow, 1, 1, 6).setValues([rowData]);

    // Định dạng thẩm mỹ cho dòng dữ liệu mới
    formatNewRow(sheet, nextRow);

    // Tự động kiểm tra và cập nhật công thức thống kê ở Hàng 3
    ensureDashboardFormulas(sheet);

    return respondJSON({
      status: "success",
      message: "Lời nhắn của em đã được gửi đi thành công! 💌",
      row: nextRow,
      timestamp: timestamp,
      hugCount: hugCount,
      todayWish: todayWish
    });

  } catch (error) {
    return respondJSON({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Xử lý kiểm tra kết nối (GET request)
 */
function doGet(e) {
  return respondJSON({
    status: "active",
    message: "Google Apps Script Web App đang hoạt động hoàn hảo! Đã sẵn sàng nhận 6 cột dữ liệu tương tác."
  });
}

/**
 * Lấy trang tính Trang tính1 (hoặc trang tính đầu tiên)
 */
function getTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * Trích xuất dữ liệu từ request (Hỗ trợ JSON body, FormData hoặc URL-encoded)
 */
function extractPayload(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {}
  }
  return e.parameter || {};
}

/**
 * Tự động tạo hoặc nâng cấp tiêu đề tại Hàng 5 (A5:F5)
 * Nếu Cột D chưa phải là "Lượt gửi ôm", sẽ tự động cập nhật lại toàn bộ tiêu đề
 */
function ensureHeaders(sheet) {
  var currentHeaderD = sheet.getRange(HEADER_ROW, 4).getValue().toString().trim();
  
  if (currentHeaderD.toLowerCase() !== "lượt gửi ôm") {
    var headers = [
      ["Thời gian gửi", "Ngày của thiệp", "Nội dung tin nhắn", "Lượt gửi ôm", "Điều muốn làm hôm nay", "Trạng thái"]
    ];
    var headerRange = sheet.getRange(HEADER_ROW, 1, 1, 6);
    headerRange.setValues(headers);
    headerRange.setBackground("#ffe4e6"); // Hồng pastel dịu ngọt
    headerRange.setFontColor("#9f1239");   // Đỏ hoa hồng thẫm
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Roboto");
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(HEADER_ROW, 34);

    // Chỉnh độ rộng các cột tối ưu cho việc xem trên điện thoại & máy tính
    sheet.setColumnWidth(1, 160); // A: Thời gian gửi
    sheet.setColumnWidth(2, 130); // B: Ngày của thiệp
    sheet.setColumnWidth(3, 360); // C: Nội dung tin nhắn
    sheet.setColumnWidth(4, 110); // D: Lượt gửi ôm
    sheet.setColumnWidth(5, 230); // E: Điều muốn làm hôm nay
    sheet.setColumnWidth(6, 120); // F: Trạng thái
  }
}

/**
 * Tìm dòng trống tiếp theo bắt đầu từ Hàng 6
 * Tuyệt đối không đè lên bảng thống kê ở B2:D3
 */
function findNextAvailableRow(sheet) {
  var maxRows = sheet.getMaxRows();
  var checkRange = sheet.getRange("A6:A" + Math.max(maxRows, 50)).getValues();

  for (var i = 0; i < checkRange.length; i++) {
    var cellVal = checkRange[i][0];
    if (cellVal === "" || cellVal === null || cellVal === undefined) {
      return START_DATA_ROW + i;
    }
  }

  // Nếu bảng đã đầy số dòng hiện có, mở rộng thêm hàng
  sheet.appendRow(["", "", "", "", "", ""]);
  return sheet.getLastRow();
}

/**
 * Định dạng thẩm mỹ cho dòng dữ liệu mới
 */
function formatNewRow(sheet, rowNumber) {
  try {
    var range = sheet.getRange(rowNumber, 1, 1, 6);
    range.setVerticalAlignment("middle");
    range.setFontFamily("Roboto");
    range.setFontSize(10);
    sheet.setRowHeight(rowNumber, 28);

    // Căn giữa: Thời gian gửi, Ngày thiệp, Lượt gửi ôm, Trạng thái
    sheet.getRange(rowNumber, 1).setHorizontalAlignment("center");
    sheet.getRange(rowNumber, 2).setHorizontalAlignment("center");
    sheet.getRange(rowNumber, 4).setHorizontalAlignment("center");
    sheet.getRange(rowNumber, 6).setHorizontalAlignment("center");

    // Căn trái: Nội dung tin nhắn, Điều muốn làm hôm nay
    sheet.getRange(rowNumber, 3).setHorizontalAlignment("left");
    sheet.getRange(rowNumber, 5).setHorizontalAlignment("left");

    // Ô Trạng thái (Cột F) gắn màu vàng nhạt cho "Chờ xử lý"
    var statusCell = sheet.getRange(rowNumber, 6);
    statusCell.setBackground("#fef3c7");
    statusCell.setFontColor("#92400e");
    statusCell.setFontWeight("bold");

    // Ô Lượt gửi ôm (Cột D) định dạng màu hồng dễ thương
    var hugCell = sheet.getRange(rowNumber, 4);
    hugCell.setFontColor("#e11d48");
    hugCell.setFontWeight("bold");
  } catch (e) {}
}

/**
 * Tự động cập nhật công thức bảng thống kê ở Hàng 3 (B3:D3)
 * Lưu ý: Trạng thái hiện tại nằm ở Cột F
 */
function ensureDashboardFormulas(sheet) {
  try {
    // Ô B3: Tổng tin nhắn = số dòng có dữ liệu ở cột A từ hàng 6
    var cellB3 = sheet.getRange("B3");
    if (!cellB3.getFormula()) {
      cellB3.setFormula('=COUNTA(A6:A)');
    }

    // Ô C3: Đã phản hồi = đếm các dòng có chữ "Đã phản hồi" ở cột F
    var cellC3 = sheet.getRange("C3");
    cellC3.setFormula('=COUNTIF(F6:F, "Đã phản hồi")');

    // Ô D3: Chờ xử lý = đếm các dòng có chữ "Chờ xử lý" ở cột F
    var cellD3 = sheet.getRange("D3");
    cellD3.setFormula('=COUNTIF(F6:F, "Chờ xử lý")');
  } catch (e) {}
}

/**
 * Trả về phản hồi JSON chuẩn có hỗ trợ CORS
 */
function respondJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
