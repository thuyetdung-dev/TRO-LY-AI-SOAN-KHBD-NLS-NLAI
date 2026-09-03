/* ============================================================================
 * standards.js — Dữ liệu chuẩn tham chiếu (KHÔNG do AI sinh ra)
 * ----------------------------------------------------------------------------
 * Mục đích: cung cấp cho AI (qua prompt) đúng nguyên văn các mã và yêu cầu cần
 * đạt (YCCĐ) chính thức, để AI CHỈ được chọn/gắn mã có trong danh sách này khi
 * tích hợp NLS/NLAI vào KHBD — thay vì tự suy đoán/bịa mã (rủi ro rất cao vì
 * hai văn bản này đều rất mới, AI khó có sẵn dữ liệu chính xác trong lúc huấn
 * luyện).
 *
 * Phạm vi: trang chỉ soạn cho lớp 10–12 (xem thuộc tính min/max của #grade
 * trong index.html), nên chỉ cần dữ liệu 3 khối lớp này — giữ dung lượng nhỏ.
 *
 * Nguồn:
 *  - AI_YCCD: trích nguyên văn mục IV.2 "Nội dung cụ thể và yêu cầu cần đạt ở
 *    các lớp" — Khung nội dung giáo dục AI, kèm theo Quyết định số
 *    2422/QĐ-BGDĐT ngày 18/8/2026 của Bộ GDĐT (chỉ lớp 10, 11, 12).
 *    Quy ước mã hoá chính thức (nêu rõ trong chính văn bản):
 *      [Lớp].[Mã chủ đề A/B/C/D + số].[Số thứ tự]
 *      — nội dung MỞ RỘNG có thêm tiền tố "MR" trước số thứ tự (vd 10.C2.MR1)
 *      — nội dung không có "MR" là nội dung CỐT LÕI (bắt buộc với mọi học sinh)
 *
 *  - NLS_NC1: trích cột "L10-L11-L12 (NC1)" của Phụ lục 1 — Bảng mã chỉ báo
 *    Năng lực số (Thông tư 02/2025/TT-BGDĐT).
 *    LƯU Ý QUAN TRỌNG — CHỖ CẦN XÁC MINH THÊM:
 *    Tài liệu Phụ lục 1 mà bạn cung cấp chỉ có BẢNG MA TRẬN (mục/tiểu mục ×
 *    mức CB1/CB2/TC1/TC2/NC1), KHÔNG có đoạn "quy ước mã hoá" chính thức như
 *    QĐ 2422 (tức không nói rõ chuỗi mã cuối cùng có bắt đầu bằng số lớp hay
 *    không). Vì vậy ở đây tạm dùng định dạng AN TOÀN, chỉ dựa trên đúng những
 *    gì bảng cung cấp: "[Số mục].[Số tiểu mục]-NC1[a/b/c/d]", ví dụ "6.2-NC1a".
 *    Nếu Thông tư 02/2025 (văn bản gốc, không phải Phụ lục) có quy định khác
 *    (vd có thêm số lớp ở đầu mã), hãy gửi thêm đoạn đó để cập nhật lại cho
 *    đúng — tránh trường hợp trang web tự đặt ra một quy ước mã không chính thức.
 * ==========================================================================*/

const AI_YCCD = {
  10: `A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM
[A1. Tính chủ động của con người — Con người trong hệ thống AI]
10.A1.1 (cốt lõi): Thực hành xác định được vai trò của con người trong sử dụng, vận hành, tùy chỉnh một hệ thống AI cụ thể.
[A1 — Con người cần kiểm soát AI]
10.A1.2 (cốt lõi): Giải thích được tại sao việc con người kiểm soát AI là quan trọng, thông qua việc liên hệ đến các giá trị như an toàn, công bằng và quyền lợi con người.
[A2. AI vì sự tiến bộ của con người — Rủi ro đối với con người và dự án AI]
10.A2.1 (cốt lõi): Nêu được một số rủi ro đối với con người, xã hội mà một sản phẩm AI có thể đem lại.
10.A2.MR1 (mở rộng): Nêu được một số biện pháp hạn chế các rủi ro đối với con người, xã hội mà một sản phẩm AI có thể đem lại thông qua một dự án sáng tạo AI.
[A3. Công dân trong kỉ nguyên AI — Luật pháp với AI]
10.A3.1 (cốt lõi): Kể tên được một vài quy định hoặc luật lệ (Luật An ninh mạng, Luật Dữ liệu, Luật Bảo vệ dữ liệu cá nhân...) có chức năng bảo vệ người dùng trong không gian số.

B. ĐẠO ĐỨC AI
[B2. Sử dụng AI an toàn và có trách nhiệm — Tuân thủ quy định và pháp luật khi sử dụng AI]
10.B2.1 (cốt lõi): Nêu được ví dụ về hành vi sử dụng AI hoặc sự cố liên quan đến AI vi phạm quy định của nhà trường hoặc pháp luật liên quan đến sử dụng công nghệ thông tin.
10.B2.MR1 (mở rộng): Nhận biết được một số dấu hiệu của nội dung do AI tạo sinh tạo ra; kiểm tra và nhận xét được mức độ minh bạch của việc khai báo sử dụng AI trong một sản phẩm.
[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Đạo đức trong vận hành và sáng tạo AI]
10.B3.1 (cốt lõi): Trình bày được ví dụ minh họa một số vấn đề đạo đức có thể phát sinh trong quá trình thiết kế và vận hành AI (thiên vị dữ liệu, vi phạm quyền riêng tư, thiếu minh bạch).

C. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI
[C2. Ứng dụng AI trong học tập và cuộc sống — Liên hệ các ứng dụng AI và vấn đề trong thực tế]
10.C2.1 (cốt lõi): Xác định được các vấn đề thực tế có thể ứng dụng AI để thực hiện (ưu tiên vấn đề gần gũi VN: nông nghiệp, cộng đồng thiểu số...).
10.C2.2 (cốt lõi): Liệt kê được tên các ứng dụng AI theo các tính năng của hệ thống.
10.C2.MR1 (mở rộng): Xác định được các yêu cầu cần có đối với việc ứng dụng AI thực hiện nhiệm vụ cụ thể.
[C2 — Một số ứng dụng AI trong học tập]
10.C2.3 (cốt lõi): Nêu được ví dụ một số trường hợp sử dụng AI hỗ trợ quá trình học tập.
10.C2.MR2 (mở rộng): Sử dụng được một số ứng dụng AI trong học tập.
[C3. Công nghệ AI — Cách đặt prompt phù hợp với mục tiêu cụ thể]
10.C3.1 (cốt lõi): Mô tả được các yêu cầu để đưa ra prompt phù hợp với mục tiêu cụ thể.
10.C3.2 (cốt lõi): Thực hành đặt prompt giải quyết một số vấn đề gần gũi trong cuộc sống, học tập một cách hiệu quả.
[C3 — Một số công nghệ trong AI]
10.C3.3 (cốt lõi): Phân biệt được AI tạo sinh với các hệ thống AI phân loại, dự đoán qua ví dụ cụ thể.
10.C3.MR1 (mở rộng): Trình bày được ví dụ mô tả một số công nghệ để thiết kế và tạo AI.
[C4. Dữ liệu trong AI — Các dạng dữ liệu huấn luyện và ảnh hưởng đến chất lượng AI]
10.C4.1 (cốt lõi): Phân tích được sự ảnh hưởng của chất lượng dữ liệu đến chất lượng AI.
10.C4.MR1 (mở rộng): Phân tích được các dạng dữ liệu (hình ảnh, âm thanh, từ ngữ...) được sử dụng để huấn luyện AI.

D. THIẾT KẾ HỆ THỐNG AI
[D1. Nhận diện và hình thành giải pháp — Ý tưởng hệ thống AI]
10.D1.1 (cốt lõi): Nêu được ví dụ cụ thể, xác định nhiệm vụ/mục tiêu cụ thể mà một hệ thống AI cần thực hiện, nêu được mối liên hệ giữa mục tiêu đó với các thành phần chính của hệ thống.
[D2. Cấu trúc và tương tác, cải tiến hệ thống — Hệ thống AI]
10.D2.1 (cốt lõi): Mô tả được các thành phần cơ bản của hệ thống AI (dữ liệu, mô hình, thuật toán, đầu ra, phản hồi) phù hợp với nhiệm vụ cụ thể.
10.D2.2 (cốt lõi): Nêu được ví dụ về một số vấn đề phát sinh trong quá trình vận hành hoặc tối ưu hoá AI và trình bày được ý nghĩa của việc khắc phục các vấn đề đó.`,

  11: `A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM
[A1. Tính chủ động của con người — Quy trình sử dụng AI an toàn]
11.A1.1 (cốt lõi): Xây dựng được quy trình sử dụng một sản phẩm AI cụ thể một cách thích hợp.
[A1 — AI để nâng cao năng lực]
11.A1.2 (cốt lõi): Phân tích được các trường hợp thực tế để thấy được tầm quan trọng của việc sử dụng AI để nâng cao năng lực con người mà vẫn đảm bảo sự kiểm soát của con người.
[A2. AI vì sự tiến bộ của con người — Bền vững và công bằng]
11.A2.1 (cốt lõi): Nêu được ví dụ về một số ứng dụng AI có tác động tích cực và mang lại lợi ích xã hội lâu dài (AI trong nông nghiệp, y tế...).
11.A2.2 (cốt lõi): Phân tích được các yếu tố thể hiện tính bền vững và công bằng của hệ thống AI đó.
[A3. Công dân trong kỉ nguyên AI — Quyền của người và dự án AI]
11.A3.1 (cốt lõi): Trình bày được các quyền cơ bản của người dùng dữ liệu (quyền được biết, quyền được đồng ý, quyền yêu cầu xoá dữ liệu...).
11.A3.MR1 (mở rộng): Phân tích được mức độ đảm bảo các quyền cơ bản của người dùng đối với một số sản phẩm AI thông qua một dự án sáng tạo AI.

B. ĐẠO ĐỨC AI
[B2. Sử dụng AI an toàn và có trách nhiệm — Phòng tránh rủi ro khi sử dụng AI]
11.B2.1 (cốt lõi): Nhận biết và phân loại được các rủi ro hoặc sự cố liên quan đến việc sử dụng AI có thể dẫn đến vi phạm quy định của nhà trường hoặc pháp luật liên quan.
[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Đạo đức trong thiết kế AI]
11.B3.MR1 (mở rộng): Xác định và sơ đồ hoá được các vấn đề đạo đức có thể phát sinh trong từng bước thiết kế và vận hành AI.

C. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI
[C2. Ứng dụng AI trong học tập và cuộc sống — Một số ứng dụng AI trong học tập]
11.C2.1 (cốt lõi): Trình bày được cách AI hỗ trợ quá trình học tập và thiết kế các công cụ hỗ trợ.
11.C2.2 (cốt lõi): Đề xuất được các tính năng AI hỗ trợ hoạt động học tập.
11.C2.MR1 (mở rộng): Sử dụng được công cụ AI để tạo và biên tập nội dung học liệu phục vụ học tập và đánh giá sản phẩm học tập.
[C3. Công nghệ AI — Cách đặt prompt phù hợp với mục tiêu cụ thể]
11.C3.1 (cốt lõi): Xác định được một số kĩ thuật prompt nâng cao (ràng buộc định dạng đầu ra, chia nhỏ nhiệm vụ...).
11.C3.MR1 (mở rộng): Vận dụng được một số kĩ thuật prompt nâng cao như trên.
[C3 — Khám phá cách thức vận hành một số hệ thống AI]
11.C3.2 (cốt lõi): Mô tả được một số công nghệ AI cơ bản: chatbot, xử lí ngôn ngữ tự nhiên, thị giác máy tính, cảm biến.
11.C3.MR2 (mở rộng): Phân tích được cách các công nghệ đó vận hành trong hệ thống AI.
[C3 — Một số phương pháp, nhiệm vụ tùy chỉnh hệ thống AI]
11.C3.MR3 (mở rộng): Xác định được một số phương pháp để tùy chỉnh hệ thống AI (bổ sung/điều chỉnh dữ liệu, điều chỉnh tham số, hướng dẫn hệ thống, kĩ thuật RAG...).
11.C3.MR4 (mở rộng): Trình bày được ở mức khái niệm cách hoạt động của kĩ thuật sinh nội dung tăng cường bằng truy xuất (RAG) và vì sao nó giúp giảm sai lệch thông tin.
[C5. Kĩ thuật và thuật toán AI — Kiến thức cơ bản về mạng nơ-ron nhân tạo]
11.C5.1 (cốt lõi): Nêu được một số ứng dụng mạng nơ-ron nhân tạo.
11.C5.MR1 (mở rộng): Trình bày được kiến thức cơ bản về mạng nơ-ron nhân tạo.
[C5 — Kiến thức cơ bản về các thuật toán phân cụm và phân lớp]
11.C5.2 (cốt lõi): Nêu được một số ứng dụng thuật toán phân cụm, phân lớp.
11.C5.MR2 (mở rộng): Trình bày được kiến thức cơ bản về các thuật toán phân cụm, phân lớp và một số ý tưởng thực hiện.

D. THIẾT KẾ HỆ THỐNG AI
[D1. Nhận diện và hình thành giải pháp — Thiết kế hệ thống AI]
11.D1.1 (cốt lõi): Trình bày được cách thức thiết kế và vận hành tổng thể của một hệ thống AI, thể hiện được mối quan hệ giữa mục tiêu, dữ liệu và các thành phần trong hệ thống.
[D2. Cấu trúc và tương tác, cải tiến hệ thống — Vận hành và tối ưu hoá hệ thống AI]
11.D2.1 (cốt lõi): Trình bày được cách thức vận hành của công nghệ trong hệ thống AI, thể hiện được mối liên hệ giữa các thành phần của hệ thống trong việc thực hiện một nhiệm vụ cụ thể.
11.D2.MR1 (mở rộng): Trình bày được các cách thức giải quyết vấn đề phát sinh của hệ thống AI nhằm tối ưu hoá hiệu quả hoạt động của hệ thống.`,

  12: `A. TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM
[A1. Tính chủ động của con người — Quyền kiểm soát của con người trong dự án AI]
12.A1.1 (cốt lõi): Phân tích được một hệ thống AI nhằm đảm bảo con người có quyền kiểm soát và chịu trách nhiệm đối với tất cả các bước quan trọng trong vòng đời AI.
12.A1.MR1 (mở rộng): Thực hiện được việc phân tích quyền kiểm soát và trách nhiệm của con người trong vòng đời AI thông qua một dự án sáng tạo AI.
[A1 — Con người trong hệ thống AI]
12.A1.2 (cốt lõi): Phân tích được vai trò của con người và AI trong các bước chính của quá trình ra quyết định.
12.A1.3 (cốt lõi): Kiểm tra được việc thực hiện trách nhiệm giải trình của con người đối với các quyết định, đối chiếu với các quy định hiện hành trong nước và quốc tế.
[A2. AI vì sự tiến bộ của con người — Nguyên tắc đạo đức khi thiết kế AI]
12.A2.1 (cốt lõi): Trình bày được các nguyên tắc đạo đức cơ bản trong thiết kế, phát triển sản phẩm AI: an toàn, công bằng, minh bạch, tôn trọng quyền riêng tư, trách nhiệm, lợi ích xã hội.
12.A2.MR1 (mở rộng): Vận dụng được các nguyên tắc để soạn thảo bộ nguyên tắc cá nhân cho một dự án AI cụ thể; đối chiếu quyết định thiết kế với bộ nguyên tắc đó và điều chỉnh khi phát hiện nguy cơ vi phạm.
[A3. Công dân trong kỉ nguyên AI — Trách nhiệm công dân trong xã hội có AI]
12.A3.1 (cốt lõi): Phân tích được nội hàm "trách nhiệm công dân trong xã hội AI": sử dụng AI an toàn, trung thực, có đạo đức; tôn trọng quyền riêng tư/dữ liệu người khác; không lan truyền thông tin sai lệch/gian lận/gây hại; góp phần xây dựng môi trường số tích cực, công bằng, nhân văn.

B. ĐẠO ĐỨC AI
[B1. Các khía cạnh đạo đức của AI — Vấn đề đạo đức của AI]
12.B1.MR1 (mở rộng): Phân tích được nguyên nhân dẫn đến các vấn đề đạo đức hoặc sai lệch trong quá trình hoạt động của hệ thống AI.
[B2. Sử dụng AI an toàn và có trách nhiệm — Mức độ rủi ro với AI]
12.B2.1 (cốt lõi): Xác định được mức độ rủi ro khi sử dụng AI có thể dẫn đến vi phạm quy định của nhà trường hoặc pháp luật liên quan.
[B3. Nguyên tắc đạo đức và trách nhiệm xã hội — Trách nhiệm trong hệ sinh thái AI]
12.B3.1 (cốt lõi): Trình bày được quyền và trách nhiệm của người phát triển, người sử dụng AI, cũng như vai trò của cá nhân trong việc góp ý, đề xuất chính sách/quy định liên quan đến AI.

C. CÁC KĨ THUẬT VÀ ỨNG DỤNG AI
[C2. Ứng dụng AI trong học tập và cuộc sống — Các yêu cầu dành cho công cụ AI hỗ trợ hoạt động học tập và xã hội]
12.C2.1 (cốt lõi): Lựa chọn được ý tưởng thiết kế một số công cụ AI để thực hiện các công việc khác nhau.
12.C2.MR1 (mở rộng): Tùy chỉnh được các yêu cầu hệ thống AI để hỗ trợ các hoạt động học tập và hoạt động xã hội.
[C3. Công nghệ AI — Một số công cụ thiết kế và phát triển hệ thống AI]
12.C3.1 (cốt lõi): Nêu được một số công cụ mã nguồn mở/miễn phí để thiết kế, huấn luyện, phát triển hệ thống AI (Teachable Machine, ML5.js, TensorFlow.js, MIT App Inventor...).
12.C3.MR1 (mở rộng): Sử dụng được một số công cụ mã nguồn mở/miễn phí nêu trên.
[C3 — Tùy chỉnh và tối ưu hệ thống AI]
12.C3.2 (cốt lõi): Nêu được ví dụ về cách thức đánh giá hiệu quả của hệ thống AI.
12.C3.MR2 (mở rộng): Đánh giá được khả năng tối ưu hệ thống AI thông qua cập nhật công nghệ, kĩ thuật mới.
12.C3.MR3 (mở rộng): Trình bày được một số khái niệm cơ bản của hệ thống ứng dụng học máy: hàm mục tiêu, tối ưu hoá hệ thống, mô hình quá khớp dữ liệu (overfitting).
[C4. Dữ liệu trong AI — Thu thập, cải thiện dữ liệu và các công cụ, nền tảng phát triển hệ thống AI]
12.C4.MR1 (mở rộng): Thu thập và tổ chức được dữ liệu đáp ứng yêu cầu của việc phát triển hệ thống AI.
12.C4.MR2 (mở rộng): Phân tích và xác định được các nền tảng/bộ công cụ phát triển AI, cải thiện các bộ dữ liệu đáp ứng quá trình thiết kế, phát triển AI.

D. THIẾT KẾ HỆ THỐNG AI
[D1. Nhận diện và hình thành giải pháp — Giải pháp hệ thống AI]
12.D1.1 (cốt lõi): Nhận biết được một số phương án thiết kế và vận hành hệ thống AI phù hợp để đạt hiệu quả cao trong một số nhiệm vụ cụ thể.
12.D1.MR1 (mở rộng): Phân tích được một số phương án thiết kế và vận hành hệ thống AI phù hợp để đạt hiệu quả cao trong một số nhiệm vụ cụ thể.
[D2. Cấu trúc và tương tác, cải tiến hệ thống — Phát triển hệ thống AI]
12.D2.1 (cốt lõi): Nhận biết được các vai trò khác nhau trong quá trình phát triển một sản phẩm AI (đề xuất ý tưởng, lập trình, huấn luyện, kiểm thử) và sự cần thiết hợp tác đa chuyên môn.
12.D2.MR1 (mở rộng): Phân tích được nguyên nhân của các vấn đề phát sinh trong hệ thống AI và lựa chọn cách giải quyết phù hợp.
12.D2.MR2 (mở rộng): Trình bày được khả năng và cấu trúc cơ bản của một hệ thống tác nhân AI (AI agent).
12.D2.MR3 (mở rộng): Xây dựng và kiểm thử được hệ thống tác nhân AI đơn giản phục vụ một nhiệm vụ học tập hoặc cộng đồng.`
};

/* Bảng mã chỉ báo Năng lực số — mức NC1 (áp dụng chung cho nhóm lớp 10-11-12),
 * trích Phụ lục 1 (Thông tư 02/2025/TT-BGDĐT). Định dạng mã dùng ở đây:
 * "[Mục].[Tiểu mục]-NC1[ý]" — xem ghi chú về việc CHƯA xác nhận được quy ước
 * mã hoá chính thức ở đầu file. KHÔNG tự thêm số lớp vào trước mã này. */
const NLS_NC1 = `1.1 Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số
1.1-NC1a: Đáp ứng được nhu cầu thông tin.
1.1-NC1b: Áp dụng được kỹ thuật tìm kiếm để lấy được dữ liệu, thông tin và nội dung trong môi trường số.
1.1-NC1c: Chỉ cho người khác cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng.
1.1-NC1d: Tự đề xuất được chiến lược tìm kiếm.

1.2 Đánh giá dữ liệu, thông tin và nội dung số
1.2-NC1a: Thực hiện đánh giá được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số.
1.2-NC1b: Tiến hành đánh giá được các dữ liệu, thông tin và nội dung số khác nhau.

1.3 Quản lý dữ liệu, thông tin và nội dung số
1.3-NC1a: Thao tác được thông tin, dữ liệu và nội dung để tổ chức, lưu trữ và truy xuất dễ dàng hơn.
1.3-NC1b: Triển khai được việc tổ chức và sắp xếp dữ liệu, thông tin và nội dung trong môi trường có cấu trúc.

2.1 Tương tác thông qua công nghệ số
2.1-NC1a: Sử dụng được nhiều công nghệ số để tương tác.
2.1-NC1b: Cho người khác thấy phương tiện giao tiếp số phù hợp nhất cho một bối cảnh cụ thể.

2.2 Chia sẻ thông tin và nội dung thông qua công nghệ số
2.2-NC1a: Chia sẻ dữ liệu, thông tin và nội dung số thông qua nhiều công cụ số phù hợp.
2.2-NC1b: Hướng dẫn người khác cách đóng vai trò trung gian để chia sẻ thông tin và nội dung thông qua công nghệ số.
2.2-NC1c: Áp dụng được nhiều phương pháp tham chiếu và ghi nguồn khác nhau.

2.3 Sử dụng công nghệ số để thực hiện trách nhiệm công dân
2.3-NC1a: Đề xuất được các dịch vụ số khác nhau để tham gia vào xã hội.
2.3-NC1b: Sử dụng được các công nghệ số thích hợp để tự mình trang bị và tham gia vào xã hội như một công dân.

2.4 Hợp tác thông qua công nghệ số
2.4-NC1a: Đề xuất được các công cụ và công nghệ số khác nhau cho các quá trình hợp tác.

2.5 Quy tắc ứng xử trên mạng
2.5-NC1a: Áp dụng được các chuẩn mực hành vi và bí quyết khác nhau khi sử dụng công nghệ số và tương tác trong môi trường số.
2.5-NC1b: Áp dụng được các chiến lược giao tiếp khác nhau trong môi trường số một cách phù hợp.
2.5-NC1c: Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau để xem xét trong môi trường số.

2.6 Quản lý danh tính số
2.6-NC1a: Sử dụng được nhiều danh tính số khác nhau.
2.6-NC1b: Áp dụng được các cách khác nhau để bảo vệ danh tính trực tuyến của bản thân.
2.6-NC1c: Sử dụng được dữ liệu tạo ra thông qua công cụ, môi trường và một số dịch vụ số.

3.1 Phát triển nội dung số
3.1-NC1a: Áp dụng được các cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau.
3.1-NC1b: Chỉ ra được những cách thể hiện bản thân thông qua việc tạo ra các nội dung số.

3.2 Tích hợp và tạo lập lại nội dung số
3.2-NC1a: Làm việc với các mục nội dung và thông tin mới khác nhau, sửa đổi, tinh chỉnh, cải thiện và tích hợp chúng để tạo ra những mục mới và độc đáo.

3.3 Thực thi bản quyền và giấy phép
3.3-NC1a: Áp dụng được các quy định khác nhau về bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số.

3.4 Lập trình
3.4-NC1a: Tự thao tác được bằng các hướng dẫn dành cho hệ thống máy tính để giải quyết một vấn đề khác hoặc thực hiện các nhiệm vụ khác nhau.

4.1 Bảo vệ thiết bị
4.1-NC1a: Áp dụng được các cách khác nhau để bảo vệ thiết bị và nội dung số.
4.1-NC1b: Nhận thức được sự đa dạng của các rủi ro và đe dọa trong môi trường số.
4.1-NC1c: Áp dụng được các biện pháp an toàn và bảo mật.
4.1-NC1d: Sử dụng được các cách thức khác nhau để quan tâm đến mức độ tin cậy và quyền riêng tư.

4.2 Bảo vệ dữ liệu cá nhân và quyền riêng tư
4.2-NC1a: Áp dụng được các cách thức khác nhau để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số.
4.2-NC1b: Áp dụng được các cách thức đặc thù để chia sẻ dữ liệu cá nhân một cách an toàn.
4.2-NC1c: Giải thích được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong các dịch vụ số.

4.3 Bảo vệ sức khỏe và an sinh số
4.3-NC1a: Trình bày được các cách thức khác nhau để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số.
4.3-NC1b: Áp dụng được các cách thức khác nhau để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số.
4.3-NC1c: Trình bày được các công nghệ số khác nhau giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội.

4.4 Bảo vệ môi trường
4.4-NC1a: Trình bày được các cách thức khác nhau để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số.

5.1 Giải quyết các vấn đề kỹ thuật
5.1-NC1a: Đánh giá được các vấn đề kỹ thuật khi sử dụng môi trường số và vận hành các thiết bị số.
5.1-NC1b: Áp dụng được các giải pháp khác nhau cho chúng.

5.2 Xác định nhu cầu và giải pháp công nghệ
5.2-NC1a: Đánh giá được nhu cầu cá nhân.
5.2-NC1b: Áp dụng được các công cụ số khác nhau và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó.
5.2-NC1c: Sử dụng được các cách khác nhau để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân.

5.3 Sử dụng sáng tạo công nghệ số
5.3-NC1a: Áp dụng được các công cụ và công nghệ số khác nhau để tạo ra kiến thức cũng như các quy trình và sản phẩm đổi mới.
5.3-NC1b: Áp dụng xử lý nhận thức của cá nhân và tập thể để giải quyết các vấn đề khái niệm và tình huống có vấn đề khác nhau trong môi trường số.

5.4 Xác định các vấn đề cần cải thiện về NLS
5.4-NC1a: Chứng minh được NLS của bản thân cần được cải thiện hoặc cập nhật ở đâu.
5.4-NC1b: Minh họa được những cách khác nhau để hỗ trợ người khác phát triển NLS của họ.
5.4-NC1c: Đề xuất được các cơ hội khác nhau để phát triển bản thân và cập nhật sự phát triển công nghệ số.

6.1 Hiểu biết về trí tuệ nhân tạo
6.1-NC1a: Phân tích được cách AI hoạt động trong các ứng dụng cụ thể.
6.1-NC1b: So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu.

6.2 Sử dụng trí tuệ nhân tạo
6.2-NC1a: Phát triển được các ứng dụng AI tùy chỉnh để giải quyết các vấn đề cụ thể.
6.2-NC1b: Điều chỉnh được các hệ thống AI để phù hợp với nhu cầu cụ thể.`;

/* Cấu trúc bắt buộc của KHBD — trích nguyên văn Phụ lục IV, Công văn số
 * 5512/BGDĐT-GDTrH ngày 18/12/2020 (mục "B. Khung kế hoạch bài dạy"),
 * áp dụng cho THPT (lớp 10-12). Dùng để "ghim" đúng tên 4 hoạt động và nội
 * hàm a) Mục tiêu b) Nội dung c) Sản phẩm d) Tổ chức thực hiện — tránh AI tự
 * đặt tên/khác cấu trúc mỗi lần sinh. */
const KHBD_TEMPLATE_5512 = `I. Mục tiêu
1. Về kiến thức: nội dung kiến thức học sinh cần học theo đúng yêu cầu cần đạt của chương trình môn học.
2. Về năng lực: yêu cầu học sinh LÀM ĐƯỢC GÌ (biểu hiện cụ thể của năng lực chung và năng lực đặc thù môn học) để chiếm lĩnh và vận dụng kiến thức.
3. Về phẩm chất: yêu cầu về hành vi, thái độ gắn với nội dung bài dạy.

II. Thiết bị dạy học và học liệu
Nêu cụ thể thiết bị, học liệu dùng để tổ chức hoạt động nhằm đạt mục tiêu bài dạy.

III. Tiến trình dạy học
1. Hoạt động 1: Xác định vấn đề/nhiệm vụ học tập/Mở đầu (đặt tên cụ thể theo nội dung bài)
2. Hoạt động 2: Hình thành kiến thức mới/giải quyết vấn đề/thực thi nhiệm vụ đặt ra từ Hoạt động 1 (đặt tên cụ thể theo nội dung bài)
3. Hoạt động 3: Luyện tập
4. Hoạt động 4: Vận dụng (thường giao cho học sinh thực hiện ngoài giờ học trên lớp, nộp báo cáo vào thời điểm phù hợp — chỉ tổ chức khi nội dung bài phù hợp)

Mỗi hoạt động PHẢI có đủ 4 phần: a) Mục tiêu  b) Nội dung  c) Sản phẩm  d) Tổ chức thực hiện.
"Tổ chức thực hiện" của mỗi hoạt động luôn theo đúng 4 bước: Giao nhiệm vụ học tập → Thực hiện nhiệm vụ (HS thực hiện; GV theo dõi, hỗ trợ) → Báo cáo, thảo luận → Kết luận, nhận định.
KHÔNG viết lời thoại cụ thể của GV/HS trong "Tổ chức thực hiện"; chỉ mô tả HÀNH ĐỘNG (GV giao nhiệm vụ/quan sát/hướng dẫn/nhận xét/đánh giá; HS thực hiện/đọc/nghe/viết/trình bày/báo cáo).
Kiểm tra, đánh giá thường xuyên được lồng trong quá trình tổ chức các hoạt động (hỏi–đáp, viết, thực hành, thí nghiệm, thuyết trình, sản phẩm học tập); nếu đánh giá bằng điểm số phải nêu rõ tiêu chí trước cho học sinh.`;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AI_YCCD, NLS_NC1, KHBD_TEMPLATE_5512 };
}
