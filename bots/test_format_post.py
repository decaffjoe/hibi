import unittest
import format_post


class TestFormatPost(unittest.TestCase):
    def test_shorten_status(self):
        status = 'something that is more than 50 characters something that is more than 50 characters'
        closing = '...bye!'  # matches [-7:]
        limit = 50

        # Status is <= limit
        self.assertLessEqual(
            50, len(format_post.shorten_status(status, closing, limit)))
        # Closing is attached (if over limit)
        self.assertEqual(
            closing,
            format_post.shorten_status(status, closing, limit)[-7:])
        # Closing is NOT attached (if under limit)
        self.assertNotEqual(
            closing,
            format_post.shorten_status(status[:50], closing, limit)[-7:])

    def test_clean_description(self):
        # Remove HTML tags/codes & spoilers
        self.assertTrue(
            '</p>' not in format_post.clean_description('<p>a tag</p>'))
        self.assertTrue('&quot;' not in format_post.clean_description(
            'he then &quot; went swimming'))
        self.assertTrue(
            '!~' not in format_post.clean_description('~! spoiler!! !~'))

    def test_image_mime(self):
        mimes = {
            'image/bmp': ['.bmp'],
            'image/gif': ['.gif'],
            'image/png': ['.png'],
            'image/svg+xml': ['.svg'],
            'image/vnd.microsoft.icon': ['.ico'],
            'image/tiff': ['.tif', '.tiff'],
            'image/webp': ['.webp'],
            'image/jpeg': ['.jpg', '.jpeg']
        }
        # All img extensions are supported
        for mime in mimes:
            for ext in mimes[mime]:
                self.assertTrue(format_post.image_mime(ext) == mime)

        # Incorrect img extensions are NOT supported
        # self.assertRaises(ValueError, format_post.image_mime, 'jpg')
        with self.assertRaises(ValueError):
            format_post.image_mime('jpg')

        with self.assertRaises(ValueError):
            format_post.image_mime('.jpgg')

        with self.assertRaises(ValueError):
            format_post.image_mime('.mp4')


if __name__ == '__main__':
    unittest.main()
