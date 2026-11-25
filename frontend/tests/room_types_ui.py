"""Run after npm run build: python3 tests/room_types_ui.py (Playwright Chromium)."""
import mimetypes
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


def test_room_types(browser):
    dist = Path(__file__).resolve().parents[1] / "dist"
    catalog = {key: dict(RoomTypeID=key, TypeName=key, BasePrice=100000,
                         StandardGuests=2, MaxGuests=3, RoomCount=0) for key in 'ABC'}
    rooms = []
    page = browser.new_page()
    page.add_init_script("""sessionStorage.setItem('roomToken', 'fixture');
        sessionStorage.setItem('roomRole', 'Admin');""")

    def serve(route):
        path = urlsplit(route.request.url).path
        if path.startswith('/api/v1/'):
            method = route.request.method
            data = []
            if path.startswith('/api/v1/room-types'):
                if method == 'GET':
                    data = list(catalog.values())
                elif method == 'PUT':
                    key = path.split('/')[-1]
                    catalog[key].update(route.request.post_data_json)
                    data = catalog[key]
            elif path.startswith('/api/v1/rooms'):
                if method == 'GET':
                    data = rooms
                elif method == 'POST':
                    fields = route.request.post_data_json
                    assert fields['RoomTypeID'] == 'A'
                    data = dict(catalog['A'], **{'RoomID': 1})
                    data.update(fields)
                    rooms.append(data)
                elif method == 'PUT':
                    rooms[0].update(route.request.post_data_json)
                    data = rooms[0]
                elif method == 'PATCH':
                    rooms[0]['Status'] = route.request.post_data_json['status']
                    data = rooms[0]
                elif method == 'DELETE':
                    rooms.clear()
            route.fulfill(json=dict(success=True, data=data))
        else:
            asset = dist / path.lstrip('/')
            if not asset.is_file():
                asset = dist / 'index.html'
            route.fulfill(path=asset, content_type=mimetypes.guess_type(asset)[0])

    page.route('**/*', serve)
    page.goto('http://localhost:5173/room-management')
    button = lambda name: page.get_by_role('button', name=name, exact=True)
    manage = button('Quản lý hạng phòng')
    manage.click()
    expect(button('Thêm hạng phòng')).to_have_count(0)
    button('Sửa hạng A').click()
    page.get_by_label('Tên hạng').fill('Hạng mới')
    page.get_by_label('Đơn giá (VNĐ)').fill('200000')
    page.get_by_label('Số khách tối đa').fill('5')
    button('Lưu hạng phòng').click()
    expect(button('Sửa hạng A')).to_be_visible()
    button('Đóng').click()
    button('Hạng mới').click()
    button('Thêm phòng mới').click()
    page.locator('select[name=type]').select_option(label='Hạng mới')
    expect(page.locator('input[name=capacity]')).to_have_value('5')
    expect(page.locator('input[name=price]')).to_have_value('200.000')
    page.locator('input[name=number]').fill('901')
    button('Thêm phòng').click()
    expect(page.get_by_role('cell', name='901', exact=True)).to_be_visible()
    button('Xem phòng 901').click()
    expect(page.get_by_role('dialog')).to_be_visible()
    button('Đóng').last.click()
    button('Sửa phòng 901').click()
    page.locator('textarea[name=note]').fill('Ghi chú mới')
    button('Lưu phòng').click()
    expect(page.get_by_role('cell', name='Ghi chú mới')).to_be_visible()
    page.get_by_label('Trạng thái phòng 901').select_option('Cleaning')
    expect(page.get_by_label('Trạng thái phòng 901')).to_have_value('Cleaning')
    button('Xóa phòng 901').click()
    button('Xóa phòng').click()
    expect(page.get_by_role('cell', name='901', exact=True)).to_have_count(0)
    guest = browser.new_page()
    guest.route('**/*', serve)
    guest.goto('http://localhost:5173/room-management')
    guest.get_by_role('button', name='Thêm phòng mới').click()
    expect(guest).to_have_url('http://localhost:5173/login?redirect=/room-management')
    staff = browser.new_page()
    staff.add_init_script("sessionStorage.setItem('roomToken','fixture');sessionStorage.setItem('roomRole','Staff')")
    staff.route('**/*', serve)
    staff.goto('http://localhost:5173/room-management')
    expect(staff.get_by_role('heading', name='Danh mục phòng lưu trú')).to_be_visible()
    expect(staff.get_by_role('button', name='Quản lý hạng phòng')).to_have_count(0)
    staff.get_by_role('button', name='Thêm phòng mới').click()
    expect(staff.get_by_role('alert')).to_have_text('Chỉ tài khoản Admin được thêm phòng.')


if __name__ == '__main__':
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        test_room_types(browser)
        browser.close()
        print('Room type UI checks passed')
