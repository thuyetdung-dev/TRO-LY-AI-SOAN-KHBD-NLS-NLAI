/* ============================================================================
 * standards.js — Dữ liệu chuẩn tham chiếu (KHÔNG do AI sinh ra)
 * ----------------------------------------------------------------------------
 * Mục đích: cung cấp cho AI (qua prompt) đúng nguyên văn các mã và yêu cầu cần
 * đạt (YCCĐ) chính thức, để AI CHỈ được chọn/gắn mã có trong danh sách này khi
 * tích hợp NLS/NLAI vào KHBD — thay vì tự suy đoán/bịa mã.
 *
 * Phạm vi: trang chỉ soạn cho lớp 10–12 (xem thuộc tính min/max của #grade
 * trong index.html).
 *
 * Nguồn AI_YCCD: trích nguyên văn mục IV.2 Khung nội dung giáo dục AI, kèm theo
 * Quyết định số 2422/QĐ-BGDĐT ngày 18/8/2026 (lớp 10, 11, 12).
 * Quy ước mã: [Lớp].[Mã chủ đề A/B/C/D+số].[Số thứ tự]; tiền tố "MR" = mở rộng.
 *
 * Nguồn NLS_BAC (DỰNG LẠI TOÀN BỘ ngày 03/09/2026): trích ĐẦY ĐỦ nguyên văn
 * Phụ lục — Khung năng lực số cho người học, ban hành kèm theo Thông tư
 * 02/2025/TT-BGDĐT ngày 24/01/2025 (hiệu lực 11/3/2025). Toàn văn có đúng 24
 * năng lực thành phần (Miền I: 3, II: 6, III: 4, IV: 4, V: 4, VI: 3), mỗi
 * năng lực thành phần có ĐỦ 8 bậc (Bậc 1–8, ứng với 4 trình độ Cơ bản/Trung
 * cấp/Nâng cao/Chuyên sâu, mỗi trình độ 2 bậc).
 *
 * BẢN TRƯỚC (NLS_NC1, đã xoá) chỉ có 23/24 tiểu mục — THIẾU hẳn 6.3 "Đánh giá
 * trí tuệ nhân tạo" — và chỉ có 1 mức gán nhãn "NC1" cho mỗi tiểu mục; khi đối
 * chiếu lại toàn văn Thông tư thì nội dung gán cho "NC1" thực ra trùng Bậc 4
 * (Trung cấp) ở một số tiểu mục, không phải một bậc "Nâng cao" như tên gợi ý.
 * Bản này thay thế hoàn toàn bằng dữ liệu đầy đủ, chính xác theo đúng số bậc
 * ghi trong văn bản gốc — không còn phụ thuộc bảng ma trận tóm lược trước đây.
 *
 * QUY ƯỚC MÃ dùng trong file này (Claude/nhóm phát triển TỰ ĐẶT — Thông tư gốc
 * không có đoạn quy định cách viết mã, chỉ gọi "Bậc 1".."Bậc 8"):
 *   [Miền].[Tiểu mục]-B[Số bậc][chữ cái ý], ví dụ "6.3-B5a" = Miền 6, tiểu mục
 *   3, Bậc 5, ý (a). Dùng số bậc tường minh (B5) thay vì viết tắt CB/TC/NC/CS
 *   để không ai nhầm đây là ký hiệu chính thức của Bộ GDĐT.
 * ==========================================================================*/

const AI_YCCD = {
 "10": "A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM\n[A1. Tính chủ động của con người — Con người trong hệ thống AI]\n10.A1.1 (cốt lõi): Thực hành xác định được vai trò của con người trong sử dụng, vận hành, tùy chỉnh một hệ thống AI cụ thể.\n[A1 — Con người cần kiểm soát AI]\n10.A1.2 (cốt lõi): Giải thích được tại sao việc con người kiểm soát AI là quan trọng, thông qua việc liên hệ đến các giá trị như an toàn, công bằng và quyền lợi con người.\n[A2. AI vì sự tiến bộ của con người — Rủi ro đối với con người và dự án AI]\n10.A2.1 (cốt lõi): Nêu được một số rủi ro đối với con người, xã hội mà một sản phẩm AI có thể đem lại.\n10.A2.MR1 (mở rộng): Nêu được một số biện pháp hạn chế các rủi ro đối với con người, xã hội mà một sản phẩm AI có thể đem lại thông qua một dự án sáng tạo AI.\n[A3. Công dân trong kỉ nguyên AI — Luật pháp với AI]\n10.A3.1 (cốt lõi): Kể tên được một vài quy định hoặc luật lệ (Luật An ninh mạng, Luật Dữ liệu, Luật Bảo vệ dữ liệu cá nhân...) có chức năng bảo vệ người dùng trong không gian số.\n\nB. ĐẠO ĐỨC AI\n[B2. Sử dụng AI an toàn và có trách nhiệm — Tuân thủ quy định và pháp luật khi sử dụng AI]\n10.B2.1 (cốt lõi): Nêu được ví dụ về hành vi sử dụng AI hoặc sự cố liên quan đến AI vi phạm quy định của nhà trường hoặc pháp luật liên quan đến sử dụng công nghệ thông tin.\n10.B2.MR1 (mở rộng): Nhận biết được một số dấu hiệu của nội dung do AI tạo sinh tạo ra; kiểm tra và nhận xét được mức độ minh bạch của việc khai báo sử dụng AI trong một sản phẩm.\n[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Đạo đức trong vận hành và sáng tạo AI]\n10.B3.1 (cốt lõi): Trình bày được ví dụ minh họa một số vấn đề đạo đức có thể phát sinh trong quá trình thiết kế và vận hành AI (thiên vị dữ liệu, vi phạm quyền riêng tư, thiếu minh bạch).\n\nC. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI\n[C2. Ứng dụng AI trong học tập và cuộc sống — Liên hệ các ứng dụng AI và vấn đề trong thực tế]\n10.C2.1 (cốt lõi): Xác định được các vấn đề thực tế có thể ứng dụng AI để thực hiện (ưu tiên vấn đề gần gũi VN: nông nghiệp, cộng đồng thiểu số...).\n10.C2.2 (cốt lõi): Liệt kê được tên các ứng dụng AI theo các tính năng của hệ thống.\n10.C2.MR1 (mở rộng): Xác định được các yêu cầu cần có đối với việc ứng dụng AI thực hiện nhiệm vụ cụ thể.\n[C2 — Một số ứng dụng AI trong học tập]\n10.C2.3 (cốt lõi): Nêu được ví dụ một số trường hợp sử dụng AI hỗ trợ quá trình học tập.\n10.C2.MR2 (mở rộng): Sử dụng được một số ứng dụng AI trong học tập.\n[C3. Công nghệ AI — Cách đặt prompt phù hợp với mục tiêu cụ thể]\n10.C3.1 (cốt lõi): Mô tả được các yêu cầu để đưa ra prompt phù hợp với mục tiêu cụ thể.\n10.C3.2 (cốt lõi): Thực hành đặt prompt giải quyết một số vấn đề gần gũi trong cuộc sống, học tập một cách hiệu quả.\n[C3 — Một số công nghệ trong AI]\n10.C3.3 (cốt lõi): Phân biệt được AI tạo sinh với các hệ thống AI phân loại, dự đoán qua ví dụ cụ thể.\n10.C3.MR1 (mở rộng): Trình bày được ví dụ mô tả một số công nghệ để thiết kế và tạo AI.\n[C4. Dữ liệu trong AI — Các dạng dữ liệu huấn luyện và ảnh hưởng đến chất lượng AI]\n10.C4.1 (cốt lõi): Phân tích được sự ảnh hưởng của chất lượng dữ liệu đến chất lượng AI.\n10.C4.MR1 (mở rộng): Phân tích được các dạng dữ liệu (hình ảnh, âm thanh, từ ngữ...) được sử dụng để huấn luyện AI.\n\nD. THIẾT KẾ HỆ THỐNG AI\n[D1. Nhận diện và hình thành giải pháp — Ý tưởng hệ thống AI]\n10.D1.1 (cốt lõi): Nêu được ví dụ cụ thể, xác định nhiệm vụ/mục tiêu cụ thể mà một hệ thống AI cần thực hiện, nêu được mối liên hệ giữa mục tiêu đó với các thành phần chính của hệ thống.\n[D2. Cấu trúc và tương tác, cải tiến hệ thống — Hệ thống AI]\n10.D2.1 (cốt lõi): Mô tả được các thành phần cơ bản của hệ thống AI (dữ liệu, mô hình, thuật toán, đầu ra, phản hồi) phù hợp với nhiệm vụ cụ thể.\n10.D2.2 (cốt lõi): Nêu được ví dụ về một số vấn đề phát sinh trong quá trình vận hành hoặc tối ưu hoá AI và trình bày được ý nghĩa của việc khắc phục các vấn đề đó.",
 "11": "A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM\n[A1. Tính chủ động của con người — Quy trình sử dụng AI an toàn]\n11.A1.1 (cốt lõi): Xây dựng được quy trình sử dụng một sản phẩm AI cụ thể một cách thích hợp.\n[A1 — AI để nâng cao năng lực]\n11.A1.2 (cốt lõi): Phân tích được các trường hợp thực tế để thấy được tầm quan trọng của việc sử dụng AI để nâng cao năng lực con người mà vẫn đảm bảo sự kiểm soát của con người.\n[A2. AI vì sự tiến bộ của con người — Bền vững và công bằng]\n11.A2.1 (cốt lõi): Nêu được ví dụ về một số ứng dụng AI có tác động tích cực và mang lại lợi ích xã hội lâu dài (AI trong nông nghiệp, y tế...).\n11.A2.2 (cốt lõi): Phân tích được các yếu tố thể hiện tính bền vững và công bằng của hệ thống AI đó.\n[A3. Công dân trong kỉ nguyên AI — Quyền của người và dự án AI]\n11.A3.1 (cốt lõi): Trình bày được các quyền cơ bản của người dùng dữ liệu (quyền được biết, quyền được đồng ý, quyền yêu cầu xoá dữ liệu...).\n11.A3.MR1 (mở rộng): Phân tích được mức độ đảm bảo các quyền cơ bản của người dùng đối với một số sản phẩm AI thông qua một dự án sáng tạo AI.\n\nB. ĐẠO ĐỨC AI\n[B2. Sử dụng AI an toàn và có trách nhiệm — Phòng tránh rủi ro khi sử dụng AI]\n11.B2.1 (cốt lõi): Nhận biết và phân loại được các rủi ro hoặc sự cố liên quan đến việc sử dụng AI có thể dẫn đến vi phạm quy định của nhà trường hoặc pháp luật liên quan.\n[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Đạo đức trong thiết kế AI]\n11.B3.MR1 (mở rộng): Xác định và sơ đồ hoá được các vấn đề đạo đức có thể phát sinh trong từng bước thiết kế và vận hành AI.\n\nC. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI\n[C2. Ứng dụng AI trong học tập và cuộc sống — Một số ứng dụng AI trong học tập]\n11.C2.1 (cốt lõi): Trình bày được cách AI hỗ trợ quá trình học tập và thiết kế các công cụ hỗ trợ.\n11.C2.2 (cốt lõi): Đề xuất được các tính năng AI hỗ trợ hoạt động học tập.\n11.C2.MR1 (mở rộng): Sử dụng được công cụ AI để tạo và biên tập nội dung học liệu phục vụ học tập và đánh giá sản phẩm học tập.\n[C3. Công nghệ AI — Cách đặt prompt phù hợp với mục tiêu cụ thể]\n11.C3.1 (cốt lõi): Xác định được một số kĩ thuật prompt nâng cao (ràng buộc định dạng đầu ra, chia nhỏ nhiệm vụ...).\n11.C3.MR1 (mở rộng): Vận dụng được một số kĩ thuật prompt nâng cao như trên.\n[C3 — Khám phá cách thức vận hành một số hệ thống AI]\n11.C3.2 (cốt lõi): Mô tả được một số công nghệ AI cơ bản: chatbot, xử lí ngôn ngữ tự nhiên, thị giác máy tính, cảm biến.\n11.C3.MR2 (mở rộng): Phân tích được cách các công nghệ đó vận hành trong hệ thống AI.\n[C3 — Một số phương pháp, nhiệm vụ tùy chỉnh hệ thống AI]\n11.C3.MR3 (mở rộng): Xác định được một số phương pháp để tùy chỉnh hệ thống AI (bổ sung/điều chỉnh dữ liệu, điều chỉnh tham số, hướng dẫn hệ thống, kĩ thuật RAG...).\n11.C3.MR4 (mở rộng): Trình bày được ở mức khái niệm cách hoạt động của kĩ thuật sinh nội dung tăng cường bằng truy xuất (RAG) và vì sao nó giúp giảm sai lệch thông tin.\n[C5. Kĩ thuật và thuật toán AI — Kiến thức cơ bản về mạng nơ-ron nhân tạo]\n11.C5.1 (cốt lõi): Nêu được một số ứng dụng mạng nơ-ron nhân tạo.\n11.C5.MR1 (mở rộng): Trình bày được kiến thức cơ bản về mạng nơ-ron nhân tạo.\n[C5 — Kiến thức cơ bản về các thuật toán phân cụm và phân lớp]\n11.C5.2 (cốt lõi): Nêu được một số ứng dụng thuật toán phân cụm, phân lớp.\n11.C5.MR2 (mở rộng): Trình bày được kiến thức cơ bản về các thuật toán phân cụm, phân lớp và một số ý tưởng thực hiện.\n\nD. THIẾT KẾ HỆ THỐNG AI\n[D1. Nhận diện và hình thành giải pháp — Thiết kế hệ thống AI]\n11.D1.1 (cốt lõi): Trình bày được cách thức thiết kế và vận hành tổng thể của một hệ thống AI, thể hiện được mối quan hệ giữa mục tiêu, dữ liệu và các thành phần trong hệ thống.\n[D2. Cấu trúc và tương tác, cải tiến hệ thống — Vận hành và tối ưu hoá hệ thống AI]\n11.D2.1 (cốt lõi): Trình bày được cách thức vận hành của công nghệ trong hệ thống AI, thể hiện được mối liên hệ giữa các thành phần của hệ thống trong việc thực hiện một nhiệm vụ cụ thể.\n11.D2.MR1 (mở rộng): Trình bày được các cách thức giải quyết vấn đề phát sinh của hệ thống AI nhằm tối ưu hoá hiệu quả hoạt động của hệ thống.",
 "12": "A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM\n[A1. Tính chủ động của con người — Quyền kiểm soát của con người trong dự án AI]\n12.A1.1 (cốt lõi): Phân tích được một hệ thống AI nhằm đảm bảo con người có quyền kiểm soát và chịu trách nhiệm đối với tất cả các bước quan trọng trong vòng đời AI.\n12.A1.MR1 (mở rộng): Thực hiện được việc phân tích quyền kiểm soát và trách nhiệm của con người trong vòng đời AI thông qua một dự án sáng tạo AI.\n[A1 — Con người trong hệ thống AI]\n12.A1.2 (cốt lõi): Phân tích được vai trò của con người và AI trong các bước chính của quá trình ra quyết định.\n12.A1.3 (cốt lõi): Kiểm tra được việc thực hiện trách nhiệm giải trình của con người đối với các quyết định, đối chiếu với các quy định hiện hành trong nước và quốc tế.\n[A2. AI vì sự tiến bộ của con người — Nguyên tắc đạo đức khi thiết kế AI]\n12.A2.1 (cốt lõi): Trình bày được các nguyên tắc đạo đức cơ bản trong thiết kế, phát triển sản phẩm AI: an toàn, công bằng, minh bạch, tôn trọng quyền riêng tư, trách nhiệm, lợi ích xã hội.\n12.A2.MR1 (mở rộng): Vận dụng được các nguyên tắc để soạn thảo bộ nguyên tắc cá nhân cho một dự án AI cụ thể; đối chiếu quyết định thiết kế với bộ nguyên tắc đó và điều chỉnh khi phát hiện nguy cơ vi phạm.\n[A3. Công dân trong kỉ nguyên AI — Trách nhiệm công dân trong xã hội có AI]\n12.A3.1 (cốt lõi): Phân tích được nội hàm \"trách nhiệm công dân trong xã hội AI\": sử dụng AI an toàn, trung thực, có đạo đức; tôn trọng quyền riêng tư/dữ liệu người khác; không lan truyền thông tin sai lệch/gian lận/gây hại; góp phần xây dựng môi trường số tích cực, công bằng, nhân văn.\n\nB. ĐẠO ĐỨC AI\n[B1. Các khía cạnh đạo đức của AI — Vấn đề đạo đức của AI]\n12.B1.MR1 (mở rộng): Phân tích được nguyên nhân dẫn đến các vấn đề đạo đức hoặc sai lệch trong quá trình hoạt động của hệ thống AI.\n[B2. Sử dụng AI an toàn và có trách nhiệm — Mức độ rủi ro với AI]\n12.B2.1 (cốt lõi): Xác định được mức độ rủi ro khi sử dụng AI có thể dẫn đến vi phạm quy định của nhà trường hoặc pháp luật liên quan.\n[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Trách nhiệm trong hệ sinh thái AI]\n12.B3.1 (cốt lõi): Trình bày được quyền và trách nhiệm của người phát triển, người sử dụng AI, cũng như vai trò của cá nhân trong việc góp ý, đề xuất chính sách/quy định liên quan đến AI.\n\nC. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI\n[C2. Ứng dụng AI trong học tập và cuộc sống — Các yêu cầu dành cho công cụ AI hỗ trợ hoạt động học tập và xã hội]\n12.C2.1 (cốt lõi): Lựa chọn được ý tưởng thiết kế một số công cụ AI để thực hiện các công việc khác nhau.\n12.C2.MR1 (mở rộng): Tùy chỉnh được các yêu cầu hệ thống AI để hỗ trợ các hoạt động học tập và hoạt động xã hội.\n[C3. Công nghệ AI — Một số công cụ thiết kế và phát triển hệ thống AI]\n12.C3.1 (cốt lõi): Nêu được một số công cụ mã nguồn mở/miễn phí để thiết kế, huấn luyện, phát triển hệ thống AI (Teachable Machine, ML5.js, TensorFlow.js, MIT App Inventor...).\n12.C3.MR1 (mở rộng): Sử dụng được một số công cụ mã nguồn mở/miễn phí nêu trên.\n[C3 — Tùy chỉnh và tối ưu hệ thống AI]\n12.C3.2 (cốt lõi): Nêu được ví dụ về cách thức đánh giá hiệu quả của hệ thống AI.\n12.C3.MR2 (mở rộng): Đánh giá được khả năng tối ưu hệ thống AI thông qua cập nhật công nghệ, kĩ thuật mới.\n12.C3.MR3 (mở rộng): Trình bày được một số khái niệm cơ bản của hệ thống ứng dụng học máy: hàm mục tiêu, tối ưu hoá hệ thống, mô hình quá khớp dữ liệu (overfitting).\n[C4. Dữ liệu trong AI — Thu thập, cải thiện dữ liệu và các công cụ, nền tảng phát triển hệ thống AI]\n12.C4.MR1 (mở rộng): Thu thập và tổ chức được dữ liệu đáp ứng yêu cầu của việc phát triển hệ thống AI.\n12.C4.MR2 (mở rộng): Phân tích và xác định được các nền tảng/bộ công cụ phát triển AI, cải thiện các bộ dữ liệu đáp ứng quá trình thiết kế, phát triển AI.\n\nD. THIẾT KẾ HỆ THỐNG AI\n[D1. Nhận diện và hình thành giải pháp — Giải pháp hệ thống AI]\n12.D1.1 (cốt lõi): Nhận biết được một số phương án thiết kế và vận hành hệ thống AI phù hợp để đạt hiệu quả cao trong một số nhiệm vụ cụ thể.\n12.D1.MR1 (mở rộng): Phân tích được một số phương án thiết kế và vận hành hệ thống AI phù hợp để đạt hiệu quả cao trong một số nhiệm vụ cụ thể.\n[D2. Cấu trúc và tương tác, cải tiến hệ thống — Phát triển hệ thống AI]\n12.D2.1 (cốt lõi): Nhận biết được các vai trò khác nhau trong quá trình phát triển một sản phẩm AI (đề xuất ý tưởng, lập trình, huấn luyện, kiểm thử) và sự cần thiết hợp tác đa chuyên môn.\n12.D2.MR1 (mở rộng): Phân tích được nguyên nhân của các vấn đề phát sinh trong hệ thống AI và lựa chọn cách giải quyết phù hợp.\n12.D2.MR2 (mở rộng): Trình bày được khả năng và cấu trúc cơ bản của một hệ thống tác nhân AI (AI agent).\n12.D2.MR3 (mở rộng): Xây dựng và kiểm thử được hệ thống tác nhân AI đơn giản phục vụ một nhiệm vụ học tập hoặc cộng đồng."
};

// Tên 4 trình độ ứng với mỗi cặp bậc (chỉ để hiển thị/giải thích, không phải mã chính thức của Bộ GDĐT)
const NLS_BAC_LABELS = {
 "1": [
  "CB1",
  "Cơ bản"
 ],
 "2": [
  "CB2",
  "Cơ bản"
 ],
 "3": [
  "TC1",
  "Trung cấp"
 ],
 "4": [
  "TC2",
  "Trung cấp"
 ],
 "5": [
  "NC1",
  "Nâng cao"
 ],
 "6": [
  "NC2",
  "Nâng cao"
 ],
 "7": [
  "CS1",
  "Chuyên sâu"
 ],
 "8": [
  "CS2",
  "Chuyên sâu"
 ]
};

// Tên 6 miền năng lực số
const NLS_MIEN_NAMES = {
 "1": "Khai thác dữ liệu và thông tin",
 "2": "Giao tiếp và hợp tác",
 "3": "Sáng tạo nội dung số",
 "4": "An toàn",
 "5": "Giải quyết vấn đề",
 "6": "Ứng dụng trí tuệ nhân tạo"
};

// Dữ liệu đầy đủ 24 tiểu mục x 8 bậc — trích nguyên văn Thông tư 02/2025/TT-BGDĐT
const NLS_BAC = {
 "1.1": {
  "title": "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số",
  "mota": "Xác định được nhu cầu thông tin; tìm kiếm được dữ liệu, thông tin và nội dung trong môi trường số; truy cập chúng và khai thác được kết quả tìm kiếm. Tạo và cập nhật được chiến lược tìm kiếm.",
  "bac": [
   [
    "Xác định được nhu cầu thông tin, tìm kiếm dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số.",
    "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.",
    "Xác định được các chiến lược tìm kiếm đơn giản."
   ],
   [
    "Xác định được nhu cầu thông tin.",
    "Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số.",
    "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.",
    "Xác định được các chiến lược tìm kiếm đơn giản."
   ],
   [
    "Giải thích được nhu cầu thông tin.",
    "Thực hiện được rõ ràng và theo quy trình các tìm kiếm để tìm dữ liệu, thông tin và nội dung trong môi trường số.",
    "Giải thích được cách truy cập và điều hướng các kết quả tìm kiếm.",
    "Giải thích được rõ ràng và theo quy trình chiến lược tìm kiếm."
   ],
   [
    "Minh họa được nhu cầu thông tin.",
    "Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số.",
    "Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.",
    "Tổ chức được các chiến lược tìm kiếm."
   ],
   [
    "Đáp ứng được nhu cầu thông tin.",
    "Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số.",
    "Chỉ cho người khác cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.",
    "Tự đề xuất được chiến lược tìm kiếm."
   ],
   [
    "Đánh giá được nhu cầu thông tin.",
    "Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số.",
    "Giải thích được cách truy cập những dữ liệu, thông tin và nội dung thích hợp nhất và điều hướng giữa chúng.",
    "Sử dụng linh hoạt và đa dạng chiến lược tìm kiếm."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp với định nghĩa hạn chế liên quan đến việc duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào thực tiễn và tri thức đồng thời hướng dẫn người khác trong việc duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "1.2": {
  "title": "Đánh giá dữ liệu, thông tin và nội dung số",
  "mota": "Phân tích, so sánh và đánh giá được độ tin cậy và tính xác thực của nguồn dữ liệu, thông tin và nội dung số. Phân tích, giải thích và đánh giá được dữ liệu, thông tin và nội dung số.",
  "bac": [
   [
    "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số."
   ],
   [
    "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số."
   ],
   [
    "Thực hiện phân tích, so sánh, đánh giá được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số đã được tổ chức rõ ràng.",
    "Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số được xác định rõ ràng."
   ],
   [
    "Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số.",
    "Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số."
   ],
   [
    "Thực hiện đánh giá được độ tin cậy của các nguồn dữ liệu, thông tin và nội dung số.",
    "Tiến hành đánh giá được các dữ liệu, thông tin và nội dung số khác nhau."
   ],
   [
    "Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số.",
    "Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp với định nghĩa hạn chế có liên quan đến việc phân tích và đánh giá độ đáng tin cậy và chính xác các nguồn dữ liệu, thông tin và nội dung trong môi trường số.",
    "Tích hợp được sự hiểu biết của bản thân để đóng góp vào thực tế và kiến thức chuyên môn, đồng thời hướng dẫn người khác trong việc phân tích và đánh giá độ tin cậy và chính xác của dữ liệu, thông tin, nội dung số và nguồn của chúng."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp với nhiều yếu tố tác động liên quan đến việc phân tích, đánh giá độ tin cậy và chính xác nguồn dữ liệu, thông tin và nội dung trong môi trường số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "1.3": {
  "title": "Quản lý dữ liệu, thông tin và nội dung số",
  "mota": "Tổ chức, lưu trữ và truy xuất được dữ liệu, thông tin và nội dung trong môi trường số. Tổ chức và sắp xếp được chúng trong một môi trường có cấu trúc.",
  "bac": [
   [
    "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.",
    "Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc."
   ],
   [
    "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số.",
    "Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc."
   ],
   [
    "Lựa chọn được dữ liệu, thông tin và nội dung để tổ chức, lưu trữ và truy xuất chúng một cách thường xuyên trong môi trường số.",
    "Sắp xếp chúng một cách trật tự trong một môi trường có cấu trúc."
   ],
   [
    "Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất.",
    "Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc."
   ],
   [
    "Thao tác được thông tin, dữ liệu và nội dung để tổ chức, lưu trữ và truy xuất dễ dàng hơn.",
    "Triển khai được việc tổ chức và sắp xếp dữ liệu, thông tin và nội dung trong môi trường có cấu trúc."
   ],
   [
    "Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ.",
    "Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất."
   ],
   [
    "Tạo ra được giải pháp cho các vấn đề phức tạp với định nghĩa hạn chế liên quan đến việc quản lý dữ liệu, thông tin và nội dung để tổ chức, lưu trữ và truy xuất chúng trong môi trường số có cấu trúc.",
    "Tích hợp được sự hiểu biết của bản thân để đóng góp vào thực tế và kiến thức chuyên môn, đồng thời hướng dẫn người khác quản lý dữ liệu, thông tin và nội dung số trong môi trường số có cấu trúc."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp với nhiều yếu tố tác động liên quan đến việc quản lý dữ liệu, thông tin và nội dung để tổ chức, lưu trữ và truy xuất chúng trong môi trường số có cấu trúc.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "2.1": {
  "title": "Tương tác thông qua công nghệ số",
  "mota": "Tương tác thông qua các công nghệ số khác nhau và nhận biết được phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể.",
  "bac": [
   [
    "Lựa chọn được các công nghệ số đơn giản để tương tác.",
    "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể."
   ],
   [
    "Lựa chọn được các công nghệ số đơn giản để tương tác.",
    "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể."
   ],
   [
    "Thực hiện được các tương tác được xác định rõ ràng và thường xuyên với các công nghệ số.",
    "Lựa chọn được các phương tiện giao tiếp số phù hợp được xác định rõ ràng và phù hợp với quy trình cho một bối cảnh cụ thể."
   ],
   [
    "Lựa chọn được nhiều công nghệ số để tương tác.",
    "Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể."
   ],
   [
    "Sử dụng được nhiều công nghệ số để tương tác.",
    "Chỉ được cho người khác thấy phương tiện giao tiếp số nào thích hợp nhất cho một bối cảnh cụ thể."
   ],
   [
    "Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất.",
    "Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp, liên quan đến tương tác thông qua công nghệ số và phương tiện giao tiếp số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào thực tiễn và kiến thức chuyên môn, đồng thời hướng dẫn những người khác tương tác thông qua công nghệ số."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác gắn liền với sự tương tác thông qua công nghệ số và phương tiện giao tiếp số.",
    "Đề xuất được những ý tưởng và quy trình mới trong lĩnh vực cụ thể."
   ]
  ]
 },
 "2.2": {
  "title": "Chia sẻ thông tin và nội dung thông qua công nghệ số",
  "mota": "Chia sẻ dữ liệu, thông tin và nội dung số với người khác thông qua các công nghệ số phù hợp. Đóng vai trò là người trung gian, hiểu biết về thực hành trích dẫn và ghi chú nguồn.",
  "bac": [
   [
    "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số.",
    "Nhận biết được tham chiếu và ghi chú nguồn cơ bản."
   ],
   [
    "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số.",
    "Nhận biết được tham chiếu và ghi chú nguồn cơ bản."
   ],
   [
    "Lựa chọn và xác định rõ các công nghệ số phù hợp để trao đổi dữ liệu, thông tin và nội dung số.",
    "Giải thích với vai trò là người trung gian để chia sẻ thông tin và xác định rõ nội dung thông qua các công nghệ số.",
    "Minh họa rõ ràng và thường xuyên các phương pháp tham chiếu và ghi chú nguồn."
   ],
   [
    "Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số.",
    "Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số.",
    "Áp dụng được các phương pháp tham chiếu và ghi chú nguồn."
   ],
   [
    "Chia sẻ dữ liệu, thông tin và nội dung số thông qua nhiều công cụ số phù hợp.",
    "Hướng dẫn người khác cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số.",
    "Áp dụng được nhiều phương pháp tham chiếu và ghi nguồn khác nhau."
   ],
   [
    "Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung.",
    "Thích ứng được vai trò trung gian của mình.",
    "Thay đổi được cách sử dụng các phương pháp tham chiếu và ghi chú phù hợp hơn."
   ],
   [
    "Tạo ra được giải pháp cho các vấn đề phức tạp liên quan đến việc chia sẻ thông qua công nghệ số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào thực tiễn và kiến thức chuyên môn, đồng thời hướng dẫn người khác chia sẻ thông qua công nghệ số."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp có nhiều yếu tố tương tác liên quan đến việc chia sẻ thông qua công nghệ số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "2.3": {
  "title": "Sử dụng công nghệ số để thực hiện trách nhiệm công dân",
  "mota": "Tham gia vào xã hội thông qua việc sử dụng các dịch vụ số công cộng và tư nhân. Tìm kiếm được cơ hội, để trao quyền và thu hút công dân thông qua các công nghệ số phù hợp.",
  "bac": [
   [
    "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội.",
    "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân."
   ],
   [
    "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội.",
    "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân."
   ],
   [
    "Lựa chọn được các dịch vụ số được xác định rõ ràng và phổ biến để tham gia vào xã hội.",
    "Xác định được các công nghệ số rõ ràng và thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân."
   ],
   [
    "Lựa chọn được các dịch vụ số để tham gia vào xã hội.",
    "Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân."
   ],
   [
    "Đề xuất được các dịch vụ số khác nhau để tham gia vào xã hội.",
    "Sử dụng được các công nghệ số thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân."
   ],
   [
    "Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội.",
    "Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp liên quan đến việc tham gia công dân thông qua công nghệ số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào thực tiễn và kiến thức chuyên môn cũng như hướng dẫn những người khác tham gia vào quyền công dân thông qua công nghệ số."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc tham gia quyền công dân thông qua công nghệ số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "2.4": {
  "title": "Hợp tác thông qua công nghệ số",
  "mota": "Sử dụng được các công cụ và công nghệ số cho các quá trình hợp tác cũng như để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức.",
  "bac": [
   [
    "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác."
   ],
   [
    "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác."
   ],
   [
    "Lựa chọn được các công cụ và công nghệ số được xác định rõ ràng và thường xuyên cho các quá trình hợp tác."
   ],
   [
    "Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác."
   ],
   [
    "Đề xuất được các công cụ và công nghệ số khác nhau cho các quá trình hợp tác."
   ],
   [
    "Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác.",
    "Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức."
   ],
   [
    "Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác.",
    "Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc sử dụng các quy trình hợp tác và xây dựng, đồng sáng tạo dữ liệu, tài nguyên và kiến thức thông qua các công cụ và công nghệ số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "2.5": {
  "title": "Quy tắc ứng xử trên mạng",
  "mota": "Nhận thức được các chuẩn mực hành vi và kiến thức khi sử dụng công nghệ số và tương tác trong môi trường số. Điều chỉnh các chiến lược giao tiếp phù hợp với đối tượng cụ thể và nhận thức được sự đa dạng về văn hóa và thế hệ trong môi trường số.",
  "bac": [
   [
    "Phân biệt được chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số.",
    "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số.",
    "Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số."
   ],
   [
    "Phân biệt được chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số.",
    "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số.",
    "Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số."
   ],
   [
    "Làm rõ được các chuẩn mực và bí quyết hành vi thông thường và được xác định rõ ràng trong khi sử dụng công nghệ số và tương tác trong môi trường số.",
    "Thể hiện được các chiến lược giao tiếp thường xuyên và xác định rõ ràng phương thức giao tiếp phù hợp trong môi trường số.",
    "Mô tả các khía cạnh đa dạng về văn hóa và thế hệ được xác định rõ ràng và thông thường cần xem xét trong môi trường số."
   ],
   [
    "Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số.",
    "Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số.",
    "Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số."
   ],
   [
    "Áp dụng được các chuẩn mực hành vi và bí quyết/cách khác nhau khi sử dụng công nghệ số và tương tác trong môi trường số.",
    "Áp dụng được các chiến lược giao tiếp khác nhau trong môi trường số một cách phù hợp.",
    "Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau để xem xét trong môi trường số."
   ],
   [
    "Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số.",
    "Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số.",
    "Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau trong môi trường số."
   ],
   [
    "Tạo ra các giải pháp cho các vấn đề phức tạp có liên quan đến nghi thức số tôn trọng các đối tượng khác nhau và sự đa dạng về văn hóa và thế hệ.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực tiễn nghề nghiệp cũng như hướng dẫn người khác giao tiếp trong môi trường số."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến nghi thức số, tôn trọng các đối tượng khác nhau và sự đa dạng về văn hóa và thế hệ.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực này."
   ]
  ]
 },
 "2.6": {
  "title": "Quản lý danh tính số",
  "mota": "Tạo và quản lý được một hoặc nhiều danh tính số để bảo vệ danh tiếng của bản thân, làm việc với dữ liệu mà một người tạo ra bằng nhiều công cụ, môi trường và dịch vụ số.",
  "bac": [
   [
    "Xác định được danh tính số.",
    "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân.",
    "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số."
   ],
   [
    "Xác định được danh tính số.",
    "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân.",
    "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số."
   ],
   [
    "Phân biệt được một loạt các danh tính số thông thường và được xác định rõ ràng.",
    "Giải thích được những cách được xác định rõ ràng và thường xuyên để bảo vệ danh tiếng trực tuyến của bản thân.",
    "Mô tả dữ liệu được xác định rõ ràng mà bạn thường xuyên thu được thông qua các công cụ, môi trường hoặc dịch vụ số."
   ],
   [
    "Hiển thị được nhiều danh tính số cụ thể.",
    "Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân.",
    "Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số."
   ],
   [
    "Sử dụng được nhiều danh tính số khác nhau.",
    "Áp dụng được các cách khác nhau để bảo vệ danh tính trực tuyến của bản thân.",
    "Sử dụng được dữ liệu tạo ra thông qua công cụ, môi trường và một số dịch vụ số."
   ],
   [
    "Phân biệt được nhiều danh tính số.",
    "Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân.",
    "Thay đổi được dữ liệu được tạo ra thông qua một số công cụ, môi trường và dịch vụ."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp liên quan đến quản lý danh tính số và bảo vệ danh tiếng trực tuyến của mọi người.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành chuyên môn cũng như hướng dẫn người khác quản lý danh tính số."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến quản lý danh tính số và bảo vệ danh tiếng trực tuyến của mọi người.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực này."
   ]
  ]
 },
 "3.1": {
  "title": "Phát triển nội dung số",
  "mota": "Tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau, nhằm thể hiện bản thân thông qua các phương tiện số.",
  "bac": [
   [
    "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.",
    "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản."
   ],
   [
    "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản.",
    "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản."
   ],
   [
    "Chỉ ra được cách tạo và chỉnh sửa nội dung có khái niệm cụ thể và mang tính phổ thông bằng những định dạng rõ ràng, phổ biến.",
    "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số thông thường và được xác định rõ ràng."
   ],
   [
    "Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.",
    "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số."
   ],
   [
    "Áp dụng được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.",
    "Chỉ ra được những cách thể hiện bản thân thông qua việc tạo ra các phương tiện số."
   ],
   [
    "Thay đổi được nội dung bằng các định dạng phù hợp nhất.",
    "Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất."
   ],
   [
    "Tạo ra được giải pháp cho các vấn đề phức tạp ở một số khía cạnh liên quan đến việc tạo, chỉnh sửa nội dung ở các định dạng khác nhau, và tự thể hiện bản thân thông qua các phương tiện số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp cũng như hướng dẫn người khác phát triển nội dung."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp, với nhiều yếu tố ảnh hưởng lẫn nhau, liên quan đến việc tạo và xuất bản nội dung ở các định dạng khác nhau và tự thể hiện bản thân thông qua các phương tiện số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "3.2": {
  "title": "Tích hợp và tạo lập lại nội dung số",
  "mota": "Sửa đổi, tinh chỉnh và tích hợp được thông tin và nội dung mới vào khối kiến thức và tài nguyên hiện có để tạo ra nội dung và kiến thức mới, độc đáo và phù hợp.",
  "bac": [
   [
    "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo."
   ],
   [
    "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo."
   ],
   [
    "Giải thích được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục nội dung và thông tin mới được xác định rõ ràng để tạo ra những nội dung và thông tin mới và độc đáo."
   ],
   [
    "Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo."
   ],
   [
    "Làm việc với các mục nội dung và thông tin mới khác nhau, sửa đổi, tinh chỉnh, cải thiện và tích hợp chúng để tạo ra những mục mới và độc đáo."
   ],
   [
    "Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp ở một số khía cạnh liên quan đến việc sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới vào kiến thức hiện có để tạo ra những kiến thức mới và độc đáo.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp, đồng thời hướng dẫn người khác tích hợp và xây dựng lại nội dung."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp, có nhiều yếu tố ảnh hưởng lẫn nhau, liên quan đến sửa đổi, sàng lọc, cải tiến và tích hợp nội dung, thông tin mới vào kiến thức hiện có để tạo ra kiến thức mới, độc đáo.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "3.3": {
  "title": "Thực thi bản quyền và giấy phép",
  "mota": "Hiểu được cách áp dụng bản quyền và giấy phép cho thông tin và nội dung số.",
  "bac": [
   [
    "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số."
   ],
   [
    "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số."
   ],
   [
    "Chỉ ra được các quy tắc thông thường và được xác định rõ ràng về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số."
   ],
   [
    "Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số."
   ],
   [
    "Áp dụng được các quy định khác nhau về bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số."
   ],
   [
    "Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp ở một số khía cạnh liên quan đến việc áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào thực tiễn và kiến thức chuyên môn cũng như hướng dẫn người khác áp dụng bản quyền và giấy phép."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp, có nhiều yếu tố ảnh hưởng lẫn nhau, liên quan đến việc áp dụng bản quyền, giấy phép đối với dữ liệu, thông tin và nội dung số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "3.4": {
  "title": "Lập trình",
  "mota": "Lập kế hoạch và phát triển được một chuỗi các câu lệnh dễ hiểu cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể.",
  "bac": [
   [
    "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản."
   ],
   [
    "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản."
   ],
   [
    "Liệt kê được các hướng dẫn thông thường và được xác định rõ ràng cho một hệ thống máy tính để giải quyết các vấn đề thường ngày hoặc thực hiện các tác vụ thường ngày."
   ],
   [
    "Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể."
   ],
   [
    "Tự thao tác được bằng các hướng dẫn dành cho hệ thống máy tính để giải quyết một vấn đề khác hoặc thực hiện các nhiệm vụ khác nhau."
   ],
   [
    "Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp, ở một số khía cạnh, liên quan đến việc lập kế hoạch và phát triển các hướng dẫn cho hệ thống máy tính và thực hiện một nhiệm vụ bằng hệ thống máy tính.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp cũng như hướng dẫn người khác lập trình."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp, có nhiều yếu tố tác động, liên quan đến việc lập kế hoạch và phát triển các hướng dẫn cho hệ thống máy tính và thực hiện một nhiệm vụ sử dụng hệ thống máy tính.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "4.1": {
  "title": "Bảo vệ thiết bị",
  "mota": "Bảo vệ được thiết bị và nội dung số; hiểu được rõ rủi ro và mối đe dọa trong môi trường số; nắm được các biện pháp an toàn và bảo mật; quan tâm đến mức độ tin cậy và quyền riêng tư.",
  "bac": [
   [
    "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.",
    "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số.",
    "Chọn lựa được các biện pháp an toàn và bảo mật đơn giản.",
    "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư."
   ],
   [
    "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản.",
    "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số.",
    "Tuân theo được các biện pháp an toàn và bảo mật đơn giản.",
    "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư."
   ],
   [
    "Chỉ ra được những cách thức cơ bản và phổ biến để bảo vệ thiết bị và nội dung số.",
    "Phân biệt được những rủi ro và mối đe dọa cơ bản và phổ biến trong môi trường số.",
    "Chọn lựa được các biện pháp an toàn và bảo mật rõ ràng và thường xuyên.",
    "Chỉ ra được những cách thức cơ bản và phổ biến để quan tâm đến mức độ tin cậy và quyền riêng tư."
   ],
   [
    "Thiết lập được những cách thức bảo vệ thiết bị và nội dung số.",
    "Phân biệt được rủi ro và mối đe dọa trong môi trường số.",
    "Chọn lựa được các biện pháp an toàn và bảo mật.",
    "Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư."
   ],
   [
    "Áp dụng được các cách khác nhau để bảo vệ thiết bị và nội dung số.",
    "Nhận thức được sự đa dạng của các rủi ro và đe dọa trong môi trường số.",
    "Áp dụng được các biện pháp an toàn và bảo mật.",
    "Sử dụng được các cách thức khác nhau để quan tâm đến mức độ tin cậy và quyền riêng tư."
   ],
   [
    "Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số.",
    "Phân biệt được rủi ro và mối đe dọa trong môi trường số.",
    "Chọn lựa được các biện pháp an toàn và bảo mật phù hợp nhất.",
    "Đánh giá được các biện pháp để quan tâm đến mức độ tin cậy và quyền riêng tư một cách phù hợp nhất."
   ],
   [
    "Thiết lập được các giải pháp cho những vấn đề mới và phức tạp liên quan đến việc bảo vệ thiết bị và nội dung số, quản lý rủi ro và mối đe dọa, áp dụng các biện pháp an toàn và bảo mật, và bảo đảm mức độ tin cậy và quyền riêng tư trong môi trường số.",
    "Tích hợp được kiến thức của bản thân để góp phần tạo nên các nội dung lý thuyết cũng như thực hành mang tính chuyên nghiệp, hướng dẫn người khác trong việc bảo vệ thiết bị."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc bảo vệ thiết bị và nội dung số, quản lý rủi ro và mối đe dọa, áp dụng các biện pháp an toàn và bảo mật, và bảo đảm mức độ tin cậy và quyền riêng tư trong môi trường số.",
    "Đề xuất được ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "4.2": {
  "title": "Bảo vệ dữ liệu cá nhân và quyền riêng tư",
  "mota": "Bảo vệ được dữ liệu cá nhân và quyền riêng tư trong môi trường số. Hiểu được cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác. Hiểu được cách các dịch vụ số sử dụng \"Chính sách Quyền riêng tư\" để thông báo phương thức sử dụng dữ liệu cá nhân.",
  "bac": [
   [
    "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác.",
    "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số."
   ],
   [
    "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác.",
    "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số."
   ],
   [
    "Giải thích được các cách thức cơ bản và phổ biến để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Giải thích được các cách thức cơ bản và phổ biến để sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn.",
    "Chỉ ra được các tuyên bố cơ bản và phổ biến trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số."
   ],
   [
    "Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn.",
    "Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số."
   ],
   [
    "Áp dụng được các cách thức khác nhau để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Áp dụng được các cách thức đặc thù để chia sẻ dữ liệu cá nhân một cách an toàn.",
    "Giải thích được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số."
   ],
   [
    "Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân.",
    "Đánh giá mức độ phù hợp của các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề mới và phức tạp liên quan đến việc bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Tích hợp kiến thức của bản thân để góp phần tạo nên các nội dung lý thuyết cũng như thực hành mang tính chuyên nghiệp, hướng dẫn người khác trong việc bảo vệ dữ liệu cá nhân và quyền riêng tư."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.",
    "Đề xuất được ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "4.3": {
  "title": "Bảo vệ sức khỏe và an sinh số",
  "mota": "Tránh được rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số. Bảo vệ được bản thân và người khác khỏi nguy cơ trong môi trường số (ví dụ: bắt nạt trên mạng). Nhận biết được những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.",
  "bac": [
   [
    "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.",
    "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.",
    "Nhận biết được những công nghệ số đơn giản cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.",
    "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số.",
    "Nhận biết được những công nghệ số đơn giản cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Giải thích được những cách thức cơ bản và phổ biến để tránh rủi ro và đe dọa đối với sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.",
    "Lựa chọn được những cách thức cơ bản và phổ biến để bảo vệ bản thân khỏi nguy cơ trong môi trường số.",
    "Chỉ ra được những công nghệ số cơ bản và phổ biến cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần.",
    "Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.",
    "Thảo luận về những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Trình bày được các cách thức khác nhau để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.",
    "Áp dụng được các cách thức khác nhau để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.",
    "Trình bày được các công nghệ số khác nhau cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.",
    "Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.",
    "Linh hoạt trong cách sử dụng những công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề mới và phức tạp liên quan đến việc tránh rủi ro và đe dọa đối với sức khỏe khi sử dụng công nghệ số để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số và sử dụng công nghệ số cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.",
    "Tích hợp được kiến thức của bản thân để góp phần tạo nên các nội dung lý thuyết cũng như thực hành mang tính chuyên nghiệp và hướng dẫn người khác trong việc bảo vệ sức khỏe."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc tránh rủi ro và đe dọa đối với sức khỏe khi sử dụng công nghệ số để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số và sử dụng công nghệ số cho tăng cường thịnh vượng xã hội và hòa hợp trong xã hội.",
    "Đề xuất được ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "4.4": {
  "title": "Bảo vệ môi trường",
  "mota": "Nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường.",
  "bac": [
   [
    "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường."
   ],
   [
    "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường."
   ],
   [
    "Chỉ ra được những tác động cơ bản và phổ biến của công nghệ số và việc sử dụng công nghệ số đối với môi trường."
   ],
   [
    "Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số."
   ],
   [
    "Trình bày được các cách thức khác nhau để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số."
   ],
   [
    "Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề mới và phức tạp liên quan đến việc bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số.",
    "Tích hợp được kiến thức của bản thân để góp phần tạo nên các nội dung lý thuyết cũng như thực hành mang tính chuyên nghiệp và hướng dẫn người khác trong việc bảo vệ môi trường."
   ],
   [
    "Thiết lập được các giải pháp cho các vấn đề phức tạp với nhiều yếu tố tương tác liên quan đến việc bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số.",
    "Đề xuất được ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "5.1": {
  "title": "Giải quyết các vấn đề kỹ thuật",
  "mota": "Xác định được các vấn đề kỹ thuật khi vận hành thiết bị, sử dụng môi trường số và giải quyết chúng (từ xử lý sự cố đến giải quyết các vấn đề phức tạp hơn).",
  "bac": [
   [
    "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số.",
    "Xác định được các giải pháp đơn giản để giải quyết chúng."
   ],
   [
    "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số.",
    "Xác định được các giải pháp đơn giản để giải quyết chúng."
   ],
   [
    "Chỉ ra được các vấn đề kỹ thuật thông thường và được xác định rõ ràng khi vận hành thiết bị và sử dụng môi trường số.",
    "Chọn được các giải pháp được xác định rõ ràng và thông thường cho chúng."
   ],
   [
    "Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.",
    "Chọn được giải pháp cho chúng."
   ],
   [
    "Đánh giá được các vấn đề kỹ thuật khi sử dụng môi trường số và vận hành các thiết bị số.",
    "Áp dụng được các giải pháp khác nhau cho chúng."
   ],
   [
    "Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.",
    "Giải quyết chúng bằng những giải pháp phù hợp nhất."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp ở một số khía cạnh liên quan đến vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp cũng như hướng dẫn người khác giải quyết các vấn đề kỹ thuật."
   ],
   [
    "Tạo ra được giải pháp giải quyết các vấn đề phức tạp, có nhiều yếu tố ảnh hưởng, liên quan đến vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "5.2": {
  "title": "Xác định nhu cầu và giải pháp công nghệ",
  "mota": "Đánh giá được nhu cầu và xác định, đánh giá, lựa chọn, sử dụng các công cụ số cùng với các giải pháp công nghệ khả thi để giải quyết chúng. Điều chỉnh và tùy chỉnh được môi trường số theo nhu cầu cá nhân (ví dụ: khả năng tiếp cận).",
  "bac": [
   [
    "Xác định được nhu cầu cá nhân, và nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Xác định được nhu cầu cá nhân, và nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Chỉ ra được những nhu cầu được xác định rõ ràng và thường xuyên, và chọn được các công cụ số thông thường và được xác định rõ ràng cũng như các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Chọn được những cách thông thường và được xác định rõ ràng để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Giải thích nhu cầu cá nhân, và lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Đánh giá được nhu cầu cá nhân.",
    "Áp dụng được các công cụ số khác nhau và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Sử dụng được các cách khác nhau để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Đánh giá được nhu cầu cá nhân.",
    "Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.",
    "Quyết định được những cách thích hợp nhất để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp, ở một số khía cạnh, bằng cách sử dụng các công cụ số và các giải pháp công nghệ có thể có, đồng thời điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp, đồng thời hướng dẫn người khác xác định nhu cầu và các giải pháp công nghệ."
   ],
   [
    "Tạo ra được các giải pháp để giải quyết các vấn đề phức tạp, với nhiều yếu tố ảnh hưởng lẫn nhau, bằng cách sử dụng các công cụ số và các giải pháp công nghệ có thể có, đồng thời điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "5.3": {
  "title": "Sử dụng sáng tạo công nghệ số",
  "mota": "Sử dụng các công cụ và công nghệ số để tạo ra kiến thức, đổi mới quy trình và sản phẩm. Gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và các tình huống có vấn đề trong môi trường số.",
  "bac": [
   [
    "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm.",
    "Thể hiện được sự quan tâm của cá nhân và tập thể đến quá trình xử lý nhận thức đơn giản để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số."
   ],
   [
    "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm.",
    "Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số."
   ],
   [
    "Chọn được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức rõ ràng cũng như các quy trình và sản phẩm đổi mới được xác định rõ ràng.",
    "Gắn kết được cá nhân và tập thể vào một số quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề mang tính khái niệm và tình huống có vấn đề thông thường và được xác định rõ ràng trong môi trường số."
   ],
   [
    "Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm.",
    "Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số."
   ],
   [
    "Áp dụng được các công cụ và công nghệ số khác nhau để tạo ra kiến thức cũng như các quy trình và sản phẩm đổi mới.",
    "Áp dụng xử lý nhận thức của cá nhân và tập thể để giải quyết các vấn đề khái niệm và tình huống có vấn đề khác nhau trong môi trường số."
   ],
   [
    "Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm.",
    "Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp ở một số khía cạnh bằng cách sử dụng các công cụ và công nghệ số.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành nghề nghiệp cũng như hướng dẫn người khác sử dụng công nghệ số một cách sáng tạo."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp với nhiều yếu tố ảnh hưởng lẫn nhau bằng các công cụ và công nghệ số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "5.4": {
  "title": "Xác định các vấn đề cần cải thiện về năng lực số",
  "mota": "Hiểu được năng lực số của chính mình cần được cải thiện hoặc cập nhật ở đâu. Có thể hỗ trợ người khác phát triển năng lực số của họ. Tìm kiếm được cơ hội phát triển bản thân và cập nhật sự phát triển số.",
  "bac": [
   [
    "Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu.",
    "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số."
   ],
   [
    "Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu.",
    "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số."
   ],
   [
    "Giải thích được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu.",
    "Chỉ ra được nơi để tìm kiếm các cơ hội được xác định rõ ràng để phát triển bản thân và cập nhật sự phát triển số."
   ],
   [
    "Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật.",
    "Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ.",
    "Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số."
   ],
   [
    "Chứng minh được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu.",
    "Minh họa được những cách khác nhau để hỗ trợ người khác phát triển năng lực số của họ.",
    "Đề xuất được các cơ hội khác nhau để phát triển bản thân và cập nhật sự phát triển số."
   ],
   [
    "Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình.",
    "Đánh giá được sự phát triển năng lực số của người khác.",
    "Lựa chọn được những cơ hội thích hợp nhất để phát triển bản thân và cập nhật những phát triển mới."
   ],
   [
    "Tạo ra được các giải pháp cho các vấn đề phức tạp ở một số khía cạnh liên quan đến việc nâng cao năng lực số và tìm cơ hội phát triển bản thân cũng như cập nhật những phát triển mới.",
    "Tích hợp được kiến thức của bản thân để đóng góp vào kiến thức và thực hành chuyên môn cũng như hướng dẫn người khác xác định khoảng trống về năng lực số."
   ],
   [
    "Tạo ra được các giải pháp giải quyết các vấn đề phức tạp, với nhiều yếu tố ảnh hưởng lẫn nhau, liên quan đến nâng cao năng lực số, tìm kiếm cơ hội phát triển bản thân và bắt kịp xu hướng phát triển số.",
    "Đề xuất được những ý tưởng và quy trình mới cho lĩnh vực cụ thể."
   ]
  ]
 },
 "6.1": {
  "title": "Hiểu biết về trí tuệ nhân tạo",
  "mota": "Hiểu được cách AI ảnh hưởng đến cuộc sống hằng ngày và vai trò của AI trong các lĩnh vực khác nhau. Nắm vững được nguyên tắc hoạt động của AI, khả năng và hạn chế của AI.",
  "bac": [
   [
    "Xác định được các khái niệm cơ bản của AI.",
    "Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày."
   ],
   [
    "Giải thích được nguyên tắc hoạt động cơ bản của AI.",
    "Diễn giải được các thuật ngữ và khái niệm liên quan đến AI."
   ],
   [
    "Áp dụng được các nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản.",
    "Thực hiện được các thao tác cơ bản trên các công cụ AI."
   ],
   [
    "Phân tích được cách AI hoạt động trong các ứng dụng cụ thể.",
    "So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu."
   ],
   [
    "Đánh giá được hiệu quả của các hệ thống AI trong việc giải quyết các vấn đề cụ thể.",
    "Kiểm tra được các giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau."
   ],
   [
    "Tổng hợp được kiến thức để đề xuất cải tiến cho các hệ thống AI.",
    "Thiết kế được các giải pháp AI sáng tạo cho các vấn đề phức tạp."
   ],
   [
    "Phát triển được các hệ thống AI tiên tiến và tùy chỉnh theo nhu cầu cụ thể.",
    "Tổ chức được việc triển khai các dự án ứng dụng AI có tính phức tạp."
   ],
   [
    "Nghiên cứu và cập nhật được các lý thuyết mới về AI.",
    "Đánh giá và xây dựng được chiến lược dài hạn cho việc ứng dụng AI trong tổ chức."
   ]
  ]
 },
 "6.2": {
  "title": "Sử dụng trí tuệ nhân tạo",
  "mota": "Sử dụng hiệu quả các hệ thống AI và hiểu rõ ứng dụng thực tế của chúng. Sử dụng được AI để tạo nội dung, khám phá kiến thức và giải quyết các vấn đề trong công việc và cuộc sống hằng ngày.",
  "bac": [
   [
    "Nhận diện được các công cụ AI đơn giản.",
    "Thực hiện được các thao tác cơ bản với các công cụ AI.",
    "Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI."
   ],
   [
    "Áp dụng được các công cụ AI để giải quyết vấn đề đơn giản.",
    "Tương tác được với các hệ thống AI cơ bản.",
    "Tuân thủ các quy định pháp luật cơ bản khi sử dụng AI."
   ],
   [
    "Sử dụng được các công cụ AI trong công việc và học tập hằng ngày.",
    "Thực hành được các kỹ năng sử dụng AI thông qua các bài tập và dự án nhỏ.",
    "Xem xét các khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư và bảo mật dữ liệu."
   ],
   [
    "Tối ưu hóa việc sử dụng các công cụ AI để đạt hiệu quả cao hơn.",
    "Quản lý được việc triển khai các công cụ AI trong các dự án nhỏ.",
    "Bảo vệ được dữ liệu cá nhân và tuân thủ các quy định pháp luật về bảo mật thông tin khi sử dụng AI."
   ],
   [
    "Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể.",
    "Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể.",
    "Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI."
   ],
   [
    "Tích hợp được các công cụ AI vào quy trình làm việc hiện có.",
    "Giám sát và bảo đảm được các hệ thống AI hoạt động đúng cách và hiệu quả.",
    "Chịu trách nhiệm về các quyết định và kết quả do hệ thống AI đưa ra, bảo đảm tuân thủ quy định pháp luật và chuẩn mực đạo đức."
   ],
   [
    "Đổi mới và tạo ra được các ứng dụng AI mới và tiên tiến.",
    "Đào tạo người khác về cách sử dụng AI hiệu quả.",
    "Lãnh đạo được việc sử dụng AI trong tổ chức một cách có trách nhiệm và đạo đức."
   ],
   [
    "Xây dựng được chiến lược dài hạn cho việc ứng dụng AI trong tổ chức.",
    "Lãnh đạo và quản lý được các dự án ứng dụng AI có phức tạp cao.",
    "Bảo đảm mọi hoạt động liên quan đến AI trong tổ chức đều tuân thủ các quy định pháp luật và tiêu chuẩn đạo đức."
   ]
  ]
 },
 "6.3": {
  "title": "Đánh giá trí tuệ nhân tạo",
  "mota": "Đánh giá và lọc được thông tin từ các nguồn được tạo ra hoặc xử lý bằng AI, để hiểu rõ hơn về tính đáng tin cậy và cách sử dụng thông tin đó. Đánh giá được AI trên các khía cạnh minh bạch, an toàn, đạo đức và tác động.",
  "bac": [
   [
    "Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá.",
    "Mô tả được các chức năng chính của hệ thống AI."
   ],
   [
    "Giải thích được cách thức hoạt động của các hệ thống AI đơn giản.",
    "Tóm tắt được các đặc điểm và ứng dụng của hệ thống AI."
   ],
   [
    "Phân tích được hiệu quả của hệ thống AI trong việc giải quyết các vấn đề cụ thể.",
    "So sánh được hiệu suất của các hệ thống AI khác nhau."
   ],
   [
    "Đánh giá được độ chính xác và tin cậy của các hệ thống AI.",
    "Xem xét được các kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI."
   ],
   [
    "Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI.",
    "Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra."
   ],
   [
    "Đưa ra được khuyến nghị cải tiến cho hệ thống AI dựa trên kết quả đánh giá.",
    "Phát triển được các tiêu chuẩn và hướng dẫn đánh giá hệ thống AI."
   ],
   [
    "Đánh giá được chiến lược ứng dụng AI trong tổ chức và đưa ra kế hoạch dài hạn.",
    "Thẩm định và xác nhận được hiệu quả của các hệ thống AI phức tạp."
   ],
   [
    "Nghiên cứu và phát triển các phương pháp đánh giá mới cho hệ thống AI.",
    "Lãnh đạo được các dự án đánh giá hệ thống AI và đưa ra các báo cáo chi tiết."
   ]
  ]
 }
};

const KHBD_TEMPLATE_5512 = "CẤU TRÚC BẮT BUỘC — dựng theo đúng thứ tự và đúng tên đề mục dưới đây.\n(Khung này theo Phụ lục IV Công văn 5512/BGDĐT-GDTrH, trình bày theo mẫu giáo án\nmà tổ chuyên môn đang dùng.)\n\nNgày soạn: .../.../...\nNgày dạy: .../.../...\n\nCHƯƠNG ...: <TÊN CHƯƠNG>\nBÀI <số>: <TÊN BÀI>\n\nI. MỤC TIÊU\n1. Kiến thức\nMở đầu bằng câu \"Học xong bài này, HS đạt các yêu cầu sau:\" rồi liệt kê các yêu cầu cần đạt, bám đúng chương trình môn học.\n2. Năng lực\n- Năng lực chung: năng lực tự chủ và tự học; năng lực giao tiếp và hợp tác; năng lực giải quyết vấn đề và sáng tạo. Mỗi năng lực phải gắn với biểu hiện cụ thể TRONG BÀI NÀY, không chép khẩu hiệu chung chung.\n- Năng lực đặc thù của môn học: nêu đúng tên các thành phần năng lực đặc thù theo chương trình môn đang soạn, kèm biểu hiện cụ thể trong bài. (Với môn Toán: tư duy và lập luận toán học; mô hình hoá toán học; giải quyết vấn đề toán học; giao tiếp toán học; sử dụng công cụ, phương tiện học toán.)\n- Năng lực số (và Năng lực AI nếu có): mỗi mục ghi mã đúng nguyên văn kèm biểu hiện quan sát được. Chỉ nêu khi hoạt động trong bài thực sự phát sinh hành vi đó.\n3. Phẩm chất\nNêu phẩm chất gắn với nội dung bài dạy, có biểu hiện cụ thể.\n\nII. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\n1. Đối với giáo viên: SGK, SGV, kế hoạch bài dạy, đồ dùng dạy học, học liệu số cụ thể.\n2. Đối với học sinh: SGK, SBT, vở ghi, đồ dùng học tập, thiết bị (nếu có).\n\nIII. TIẾN TRÌNH DẠY HỌC\nChia rõ theo TỪNG TIẾT. Trước mỗi cụm hoạt động phải có dòng tiêu đề \"TIẾT <n>: <tên nội dung dạy trong tiết đó>\". Tổng số tiết phải đúng số tiết được giao.\n\nTIẾT 1: <tên nội dung>\n\n1. HOẠT ĐỘNG KHỞI ĐỘNG (MỞ ĐẦU)\na) Mục tiêu:\nb) Nội dung:\nc) Sản phẩm:\nd) Tổ chức thực hiện:\n   Viết theo văn xuôi, đủ 4 bước, mỗi bước là một đề mục in đậm:\n   Bước 1: Chuyển giao nhiệm vụ\n   Bước 2: Thực hiện nhiệm vụ\n   Bước 3: Báo cáo, thảo luận\n   Bước 4: Kết luận, nhận định\n\n2. HÌNH THÀNH KIẾN THỨC MỚI\nHoạt động 1: <tên hoạt động theo đúng nội dung kiến thức>\na) Mục tiêu:\nb) Nội dung:\nc) Sản phẩm:\nd) Tổ chức thực hiện:  ← chỗ này dùng khối lessonflow, KHÔNG viết bảng Markdown.\nHoạt động 2, 3, ... nếu bài còn nội dung kiến thức khác (số hoạt động do nội dung bài quyết định, không cố định).\n\nTIẾT 2: <tên nội dung>   ← tiếp tục như trên cho đủ số tiết\n\n3. HOẠT ĐỘNG LUYỆN TẬP\na) Mục tiêu: b) Nội dung: c) Sản phẩm: d) Tổ chức thực hiện:\nPhải có hệ thống bài tập cụ thể (trắc nghiệm và/hoặc tự luận) VÀ phần \"Gợi ý đáp án\" giải chi tiết.\n\n4. HOẠT ĐỘNG VẬN DỤNG\na) Mục tiêu: b) Nội dung: c) Sản phẩm: d) Tổ chức thực hiện:\nViết 4 bước theo văn xuôi. Phải có phần \"Gợi ý đáp án\" trình bày lời giải đầy đủ.\n\n* HƯỚNG DẪN VỀ NHÀ\n- Ghi nhớ kiến thức trong bài.\n- Hoàn thành bài tập trong SBT.\n- Chuẩn bị bài mới: \"<tên bài kế tiếp>\".\n\nĐIỀU CHỈNH SAU BÀI DẠY\n(để trống hoặc ghi \"...\") — phần giáo viên tự ghi sau khi dạy thực tế.\n\n=== YÊU CẦU VỀ ĐỘ SÂU NỘI DUNG (quan trọng nhất) ===\nĐây là kế hoạch để GIÁO VIÊN CẦM LÊN LỚP DẠY, không phải bản tóm tắt hay đề cương.\n- Cột \"Sản phẩm dự kiến\" phải chứa NỘI DUNG KIẾN THỨC ĐẦY ĐỦ, viết ra thành chữ:\n  định nghĩa nguyên văn, định lí, kết luận, chú ý, và LỜI GIẢI CHI TIẾT của từng\n  hoạt động/ví dụ/luyện tập trong sách. Tuyệt đối KHÔNG viết nhãn rỗng kiểu\n  \"SP1: Kết luận về tính đơn điệu\" hay \"Lời giải các bài tập\" — phải viết ra\n  chính nội dung đó.\n- Với môn Toán: mọi định nghĩa, công thức, phép biến đổi, đáp số đều phải viết ra\n  bằng công thức thật. Một kế hoạch bài dạy môn Toán không có công thức nào là\n  không đạt.\n- Cột hoạt động của GV và HS chỉ mô tả HÀNH ĐỘNG (giao nhiệm vụ, quan sát, hướng\n  dẫn, nhận xét, chốt kiến thức / HS đọc, thảo luận, trình bày, ghi bài), không\n  viết lời thoại cụ thể.\n- Kiểm tra, đánh giá thường xuyên lồng ngay trong quá trình tổ chức hoạt động\n  (hỏi-đáp, viết, thực hành, sản phẩm học tập); nếu đánh giá bằng điểm số phải nêu\n  rõ tiêu chí trước cho học sinh.";


// Dựng khối văn bản NLS để nhúng vào prompt, cho một danh sách bậc chỉ định (mặc định 1..8 = toàn bộ).
// Mỗi dòng có mã tường minh "[Miền].[Tiểu mục]-B[Bậc][chữ]" đứng trước, để AI CHỈ được chọn
// đúng những mã xuất hiện ở đây, không tự bịa mã hay mượn bậc/tiểu mục không có trong danh sách.
function buildNLSText(bacList){
  bacList = bacList || [1,2,3,4,5,6,7,8];
  const abc = 'abcdefgh';
  let out = '';
  for (const code of Object.keys(NLS_BAC)) {
    const item = NLS_BAC[code];
    out += '\n' + code + ' ' + item.title + '\n';
    out += 'Mô tả tổng quát: ' + item.mota + '\n';
    bacList.forEach(function(bac){
      const arr = item.bac[bac - 1] || [];
      const lbl = NLS_BAC_LABELS[String(bac)] || ['B'+bac, ''];
      const trinhdo = lbl[1];
      arr.forEach(function(text, i){
        out += code + '-B' + bac + (abc[i]||'') + ' (Bậc ' + bac + ' — ' + trinhdo + '): ' + text + '\n';
      });
    });
  }
  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AI_YCCD, NLS_BAC, NLS_BAC_LABELS, NLS_MIEN_NAMES, buildNLSText, KHBD_TEMPLATE_5512 };
}
