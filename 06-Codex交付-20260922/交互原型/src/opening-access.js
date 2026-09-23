export function canHandleOpening(session,app){
  if(!session||!app)return false;
  if(session.role==='系统管理员')return true;
  if(session.role!=='开户媒介'||!app.assignee)return false;
  if(app.assigneeId)return app.assigneeId===(session.employeeId||session.userId||session.id);
  return !!session.name&&app.assignee===session.name;
}
