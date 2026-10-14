const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const { pool, initializeDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép tải lên file ảnh (JPEG, JPG, PNG, GIF)'));
        }
    }
});

// Vietnamese love messages for the landing page
const loveMessages = [
    "Mẹ là người phụ nữ tuyệt vời nhất trên đời!",
    "Em là ánh sáng trong cuộc đời anh!",
    "Chị gái là người bạn thân nhất của em!",
    "Bà ngoại là kho báu quý giá nhất!",
    "Cô giáo là người truyền cảm hứng cho em!",
    "Bạn gái là niềm hạnh phúc của anh!",
    "Vợ yêu là trái tim của gia đình!",
    "Con gái là niềm tự hào của bố mẹ!"
];

// Routes
app.get('/', (req, res) => {
    const customMessage = req.query.msg || req.query.message;
    const defaultMessage = process.env.CARD_MESSAGE || `Chúc bạn yêu 20/10 vui vẻ!

Mình viết làm cái này trước lúc bạn thi nên là mình chúc bạn thi tốt nhé.
Chúc bạn là luôn luôn xinh đẹp và hoàn thành được những mục tiêu sắp tới, hoàn thành KLTN, tốt nghiệp xuất sắc, có được dự định tương lai.

Thật sự là từ lúc mà bạn bảo bạn thi xong bạn về quê, mình cũng có nhiều tâm trạng, cũng muốn gặp bạn để nói chuyện nhưng mà bạn còn những việc khác nữa. Mà mình cũng không biết là mình có gặp được bạn trước khi bạn về không, nên là mình nói một chút qua cái này nhé.

Không phải mình nghĩ là bạn về quê thì bọn mình không còn liên lạc hay không gặp được nhau đâu mà mình nghĩ là bạn sắp học xong rồi, bạn cũng không ở HN, mình sợ bọn mình không còn điểm chung gì để nói chuyện hằng ngày nữa.

Mình luôn ủng hộ mọi quyết định, mọi con đường của bạn. Dù bạn có dự định hay lựa chọn như thế nào, chắc chắn mình sẽ luôn ủng hộ và cố gắng hết mình để giúp đỡ bạn.

Chỉ là bọn mình vốn tính cách, con người đã khác nhau. Giờ bọn sắp học xong rồi, cuộc sống bọn mình lại càng khác nhau nữa. Bạn 21 tuổi có những dự định về thời gian khác mà mình 21 tuổi lại có những dự định về thời gian khác. Hôm qua ấy, bạn bảo là bạn đã 21 tuổi rồi còn mình thì lại nghĩ mình mới 21 thôi mà. 

Mình cũng mông lung lắm. Mình làm những thứ không chắc chắn nó sẽ có kết quả gì. Nếu mình sai, chắc chắn mình sẽ làm lại nhưng mà làm lại thì lại tốn thêm nhiều thời gian nữa. Rồi nếu làm lại mà vẫn sai thì phải đánh đổi bao nhiêu thời gian nữa.

Bạn thích cuộc sống dễ chịu, ưa nghe lời dễ nghe trong khi mình lại không hay nói lời nhẹ nhàng. Mình biết là trong thời gian qua, bạn đã phải chịu đựng mình nhiều. Mình thương bạn lắm nhưng cũng chẳng thay đổi được thời gian. Có thể nhiều lúc bạn thấy mình thờ ơ, vô tâm hay tồi gì đó nhưng mình mong là bạn nhớ bạn luôn có vị trí đặc biệt đối với mình và mình thương bạn là thật.

Mẹ mình hay dạy mình sự nhẹ nhàng, tử tế. Mình không giỏi dùng những điều đấy nhưng mà mình chưa gọt rũa hay làm cho nó hào nhoáng. Mình luôn muốn gửi gắm những điều đấy ở nơi bạn một cách chân thành nhất. Có thể là trước giờ mình làm chưa tốt nhưng nếu có cơ hội mình chắc chắn sẽ cố gắng.

Chúc chúc bạn nhé.
Luôn luôn xinh đẹp, luôn luôn hạnh phúc.
Luôn có nhiều điều tốt đẹp trong cuộc sống.
Luôn nhận được những điều may mắn.
Luôn nhận được những điều nhẹ nhàng.`;

    const message = customMessage || defaultMessage;
    
    res.render('index', {
        message,
        title: 'Chúc bạn yêu 20/10 vui vẻ!'
    });
});




// Generate AI message
app.post('/api/generate-message', async (req, res) => {
    try {
        const { relationship, receiver } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                success: false,
                message: 'AI service not configured'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Tạo một tin nhắn yêu thương bằng tiếng Việt cho ${relationship} tên ${receiver} nhân ngày 8/3. Tin nhắn nên ấm áp, chân thành và phù hợp với mối quan hệ. Độ dài khoảng 2-3 câu.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            message: text.trim()
        });
    } catch (error) {
        console.error('Error generating AI message:', error);
        res.json({
            success: false,
            message: 'Không thể tạo tin nhắn AI. Vui lòng thử lại.'
        });
    }
});

// Create gift
app.post('/create-gift', upload.single('image'), async (req, res) => {
    try {
        const { receiver, sender, message, template } = req.body;
        const giftUuid = uuidv4();

        let imagePath = null;
        if (req.file) {
            imagePath = req.file.filename;
        }

        // Save to database
        const query = `
      INSERT INTO gifts (uuid, receiver, sender, message, image_path, template) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        await pool.promise().execute(query, [giftUuid, receiver, sender, message, imagePath, template]);

        // Generate QR code
        const giftUrl = `${BASE_URL}/gift/${giftUuid}`;
        const qrCodeDataURL = await QRCode.toDataURL(giftUrl);

        res.render('success', {
            title: 'Tạo Thiệp Thành Công!',
            giftUrl,
            qrCodeDataURL,
            giftUuid
        });

    } catch (error) {
        console.error('Error creating gift:', error);
        res.status(500).render('error', {
            title: 'Lỗi',
            message: 'Có lỗi xảy ra khi tạo thiệp. Vui lòng thử lại.'
        });
    }
});

// Display gift
app.get('/gift/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;

        const query = 'SELECT * FROM gifts WHERE uuid = ?';
        const [rows] = await pool.promise().execute(query, [uuid]);

        if (rows.length === 0) {
            return res.status(404).render('error', {
                title: 'Không Tìm Thấy',
                message: 'Thiệp yêu thương này không tồn tại hoặc đã bị xóa.'
            });
        }

        const gift = rows[0];
        res.render('gift', {
            title: `Thiệp Yêu Thương - ${gift.receiver}`,
            gift
        });

    } catch (error) {
        console.error('Error displaying gift:', error);
        res.status(500).render('error', {
            title: 'Lỗi',
            message: 'Có lỗi xảy ra khi hiển thị thiệp.'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).render('error', {
                title: 'Lỗi Tải File',
                message: 'File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB.'
            });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).render('error', {
        title: 'Lỗi Hệ Thống',
        message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Không Tìm Thấy Trang',
        message: 'Trang bạn tìm kiếm không tồn tại.'
    });
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log('Vietnamese Women\'s Day Gift Card Website is ready!');
    });
}).catch(error => {
    console.error('Failed to start server:', error);
});

