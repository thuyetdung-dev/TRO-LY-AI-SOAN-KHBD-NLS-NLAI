/* V28 duration audit hotfix.
   Keep this patch isolated from upload/API code: it only replaces the global
   per-period duration auditor after app.js has loaded. */
(function(){
  const durationRe=/\((?:\s*Thời lượng\s*:\s*)?(\d+)\s*phút(?:[^)]*)\)/i;
  const durationReAll=/\((?:\s*Thời lượng\s*:\s*)?(\d+)\s*phút(?:[^)]*)\)/gi;
  const activityRe=/^\s{0,3}#{1,6}\s*(?:\d+\.\s*)?(HOẠT ĐỘNG KHỞI ĐỘNG(?:\s*\(MỞ ĐẦU\))?|HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC(?:\s*MỚI)?|HÌNH THÀNH KIẾN THỨC MỚI|HOẠT ĐỘNG LUYỆN TẬP|HOẠT ĐỘNG VẬN DỤNG|TỔNG KẾT VÀ KIỂM TRA ĐẦU GIỜ)[^\n]*$/gim;

  window.auditPeriodDurations=function(text,periods){
    const src=String(text||'');
    const marks=[...src.matchAll(/^\s{0,3}#{0,6}\s*TIẾT\s*(\d+)\s*:/gim)];
    if(Number(periods)<=1||new Set(marks.map(m=>Number(m[1]))).size!==Number(periods))return null;

    const rows=[];
    marks.forEach((m,i)=>{
      const section=src.slice(m.index,i+1<marks.length?marks[i+1].index:src.length);
      const flowMinutes=parseLessonFlows(section).reduce((sum,f)=>sum+(!f?.__error&&Array.isArray(f.rows)
        ?f.rows.reduce((s,r)=>s+(Number(r.duration)>0?Number(r.duration):0),0):0),0);

      /* Hình thành kiến thức ghi thời lượng tổng ở tiêu đề và chia lại cùng số phút
         trong lessonflow. Không cộng thời lượng tiêu đề này lần thứ hai. */
      const activities=[...section.matchAll(activityRe)];
      let proseMinutes=0;
      const missing=[];
      activities.forEach((h,j)=>{
        const name=String(h[1]||'');
        if(/HÌNH THÀNH KIẾN THỨC/i.test(name))return;
        const block=section.slice(h.index,j+1<activities.length?activities[j+1].index:section.length);
        const duration=block.match(durationRe);
        if(duration)proseMinutes+=Number(duration[1]);
        else missing.push(name);
      });

      /* Phần đầu tiết — từ dòng "## TIẾT n:" cho tới tiêu đề hoạt động ĐẦU TIÊN — trước đây
         bị bỏ quên hoàn toàn. Khi giáo viên (hoặc AI) ghi "(Thời lượng: N phút)" ngay dưới
         tên tiết, hoặc khi cả tiết không có tiêu đề hoạt động nào mà bản vá này nhận ra,
         toàn bộ số phút đó biến mất khỏi phép cộng.
         Hậu quả thật: một tiết đủ 45 phút (44 phút trong lessonflow + 1 phút ghi ngoài) bị
         báo "mới phân bổ 44/45 phút" và CHẶN xuất Word — giáo viên không hiểu vì sao, vì
         nhìn bằng mắt thì bài soạn không thiếu phút nào.
         Chỉ cộng thêm phần đầu tiết, không đụng tới các khối hoạt động đã tính ở trên, nên
         cơ chế chống cộng hai lần của Hình thành kiến thức giữ nguyên. */
      const dauTiet=section.slice(0,activities.length?activities[0].index:section.length);
      proseMinutes+=[...dauTiet.matchAll(durationReAll)].reduce((s,x)=>s+Number(x[1]),0);

      rows.push({
        period:Number(m[1]),
        minutes:flowMinutes+proseMinutes,
        flowMinutes,
        proseMinutes,
        missing
      });
    });
    return {rows,minutes:rows.reduce((sum,row)=>sum+row.minutes,0),expected:Number(periods)*45};
  };
})();
