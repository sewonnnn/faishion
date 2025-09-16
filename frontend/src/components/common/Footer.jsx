import "./Footer.css"

const Footer = () => {
    return (
        <div className="Footer_Container">
            <div className={"Left"}>
                <table>
                    <tr>
                        <td><a href={"#"}>공지사항</a></td>
                        <td><a href={"#"}>QnA</a></td>
                    </tr>
                </table>
            </div>
            <div className={"Right"}>
                <table>
                    <tr>
                        <td colSpan={3}><h4>(주) fAIshion</h4></td>
                    </tr>
                    <tr>
                        <td>대표자 명 : #</td>
                        <td>주소 : #</td>
                        <td>사업자등록번호 : #</td>
                    </tr>
                    <tr>
                        <td colSpan={3}>통신판매업신고 : 제20241010</td>
                    </tr>
                    <tr>
                        <td>고객센터 : #</td>
                        <td colSpan={2}>이메일 : #</td>
                    </tr>
                </table>
            </div>
        </div>
    )
}

export default Footer;