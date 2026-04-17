export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Điều khoản sử dụng
        </h1>

        <p className="mb-6 text-gray-700">
          Khi sử dụng hệ thống tra cứu thông tin bệnh và thuốc, người dùng đồng ý tuân
          thủ các điều khoản và quy định được nêu dưới đây.
        </p>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            1. Mục đích sử dụng
          </h2>
          <p className="text-gray-700">
            Chúng tôi xây dựng hệ thống này như một nguồn tham khảo và nơi kết nối 
            cộng đồng để bạn hiểu rõ hơn về các loại bệnh và triệu chứng. 
            Tuy nhiên, hãy luôn tham khảo ý kiến bác sĩ trước khi đưa ra bất kỳ quyết định y tế nào, 
            vì nội dung của chúng tôi không thay thế cho tư vấn chuyên môn.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            2. Quyền và trách nhiệm của người dùng
          </h2>
          <ul className="ml-6 list-disc space-y-1 text-gray-700">
            <li>Cung cấp thông tin đăng ký chính xác và hợp lệ.</li>
            <li>Không sử dụng hệ thống cho mục đích vi phạm pháp luật.</li>
            <li>Không đăng tải nội dung sai lệch, gây hiểu nhầm về y tế.</li>
            <li>Chịu trách nhiệm với nội dung do mình đăng tải trên diễn đàn.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            3. Quyền của quản trị viên
          </h2>
          <ul className="ml-6 list-disc space-y-1 text-gray-700">
            <li>Quản lý và kiểm duyệt nội dung do người dùng đăng tải.</li>
            <li>Xóa, khóa hoặc chỉnh sửa nội dung không phù hợp.</li>
            <li>Tạm khóa hoặc khóa vĩnh viễn tài khoản nếu vi phạm điều khoản.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            4. Bảo mật thông tin
          </h2>
          <p className="text-gray-700">
            Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Mọi thông tin cá nhân thu thập 
            được chỉ nhằm mục đích tối ưu hóa trải nghiệm người dùng và vận hành hệ thống. 
            Chúng tôi không mua bán, chia sẻ dữ liệu này cho bên thứ ba vì mục đích thương mại.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            5. Giới hạn trách nhiệm
          </h2>
          <p className="text-gray-700">
            Mọi hành vi tự ý điều trị hoặc sử dụng dược phẩm dựa trên nội dung tại website này 
            đều nằm ngoài phạm vi trách nhiệm của hệ thống. Người dùng cần hoàn toàn chịu 
            trách nhiệm về các quyết định cá nhân.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            6. Thay đổi điều khoản
          </h2>
          <p className="text-gray-700">
            Chúng tôi có quyền cập nhật hoặc thay đổi điều khoản sử dụng bất kỳ lúc nào
            để phù hợp với quy định và quá trình vận hành của hệ thống.
          </p>
        </section>
      </div>
    </div>
  );
}