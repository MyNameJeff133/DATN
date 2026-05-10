import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const COMMENT_MAX_LENGTH = 500;

function buildCommentTree(comments, parentId = null) {
  return comments
    .filter((comment) => String(comment.parentComment || "") === String(parentId || ""))
    .map((comment) => ({
      ...comment,
      replies: buildCommentTree(comments, comment._id),
    }));
}

function CommentItem({ comment, level, onReply }) {
  const nested = level > 0;
  const nestedClass = nested ? "mt-3 border-l-2 border-cyan-100 pl-3 sm:pl-4" : "";

  return (
    <div className={`min-w-0 ${nestedClass}`}>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-0">
          <p className="font-bold text-slate-950">{comment.author?.name || "Người dùng"}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {comment.content}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onReply(comment)}
          className="mt-3 text-sm font-bold text-cyan-700 transition hover:text-cyan-800"
        >
          Trả lời
        </button>
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-3 min-w-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              level={Math.min(level + 1, 6)}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ postId, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/comments/${postId}`);
        setComments(res.data);
        onCountChange?.(res.data.length);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Không thể tải bình luận lúc này");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [onCountChange, postId]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (content.trim().length > COMMENT_MAX_LENGTH) {
      setError(`Nội dung bình luận tối đa ${COMMENT_MAX_LENGTH} ký tự`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await api.post("/comments", {
        content: content.trim(),
        postId,
        parentComment: replyTo?._id || null,
      });

      setComments((prev) => {
        const nextComments = [...prev, res.data];
        onCountChange?.(nextComments.length);
        return nextComments;
      });
      setContent("");
      setReplyTo(null);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Không gửi được bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 overflow-x-hidden">
      <div className="up-section overflow-hidden p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Bình luận</h3>
            <p className="mt-1 text-sm text-slate-500">
              Chia sẻ ý kiến và trao đổi thêm về bài viết này.
            </p>
          </div>
          <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
            {comments.length} bình luận
          </div>
        </div>

        <div className="mt-5 min-w-0 rounded-2xl bg-slate-50 p-4">
          {replyTo && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm text-cyan-700">
              <span>
                Đang trả lời <strong>{replyTo.author?.name || "người dùng"}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="font-bold text-cyan-700 hover:text-cyan-800"
              >
                Hủy
              </button>
            </div>
          )}

          <textarea
            className="up-field min-h-28"
            placeholder={replyTo ? "Viết câu trả lời của bạn..." : "Viết bình luận của bạn..."}
            value={content}
            maxLength={COMMENT_MAX_LENGTH}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-2 text-right text-xs text-slate-500">
            {content.length}/{COMMENT_MAX_LENGTH} ký tự
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button type="button" onClick={handleSubmit} disabled={submitting} className="up-btn-primary">
              {submitting ? "Đang gửi..." : replyTo ? "Gửi trả lời" : "Gửi bình luận"}
            </button>
          </div>
        </div>

        <div className="mt-5 min-w-0 space-y-4 overflow-hidden">
          {loading ? (
            <StateBox>Đang tải bình luận...</StateBox>
          ) : commentTree.length === 0 ? (
            <StateBox dashed>Chưa có bình luận nào. Hãy là người đầu tiên tham gia trao đổi.</StateBox>
          ) : (
            commentTree.map((comment) => (
              <CommentItem key={comment._id} comment={comment} level={0} onReply={setReplyTo} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function StateBox({ dashed = false, children }) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 ${
        dashed ? "border border-dashed border-slate-300" : ""
      }`}
    >
      {children}
    </div>
  );
}
