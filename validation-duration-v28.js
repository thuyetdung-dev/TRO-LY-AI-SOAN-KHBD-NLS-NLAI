/* V28 duration audit hotfix.
   Keep this patch isolated from upload/API code: it only replaces the global
   per-period duration auditor after app.js has loaded. */
(function(){
  const durationRe=/\((?:\s*Thời lượng\s*:\s*)?(\d+)\s*phút(?:[^)]*)\)/i;
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
